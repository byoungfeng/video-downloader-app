"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Download, Play, Clock, AlertCircle, CheckCircle, Info } from "lucide-react"
import { useVideoDownloader } from "../video-downloader-context"
import { extractorManager } from "@/lib/video-extractors/extractor-manager"
import { videoDownloader } from "@/lib/video-downloader"
import { PlatformSupportInfo } from "../platform-support-info"

interface VideoAnalysisResult {
  success: boolean
  video?: {
    title: string
    description?: string
    duration: number
    thumbnail: string
    author?: string
    platform: string
  }
  formats?: Array<{
    quality: string
    format: string
    url: string
    size?: number
  }>
  error?: string
  extractor?: string
}

export function DownloadTab() {
  const [url, setUrl] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<VideoAnalysisResult | null>(null)
  const [selectedQuality, setSelectedQuality] = useState("1080p")
  const [selectedFormat, setSelectedFormat] = useState("mp4")
  const [selectedExtractor, setSelectedExtractor] = useState("auto")
  const [showPlatformInfo, setShowPlatformInfo] = useState(false)
  const { addDownload } = useVideoDownloader()

  const availableExtractors = extractorManager.getAllExtractors()

  const handleAnalyze = async () => {
    if (!url.trim()) return

    setIsAnalyzing(true)
    setAnalysisResult(null)

    try {
      // 检查URL格式
      new URL(url)

      // 检查是否为受限平台
      const urlObj = new URL(url)
      if (isRestrictedPlatform(urlObj.hostname)) {
        setAnalysisResult({
          success: false,
          error: getRestrictedPlatformMessage(urlObj.hostname),
        })
        setIsAnalyzing(false)
        return
      }

      // 使用提取器管理器解析视频
      const result = await extractorManager.extract(
        {
          url: url.trim(),
          quality: selectedQuality,
          format: selectedFormat,
        },
        selectedExtractor === "auto" ? undefined : selectedExtractor,
      )

      if (result.success && result.data) {
        setAnalysisResult({
          success: true,
          video: result.data.video,
          formats: result.data.formats,
          extractor: selectedExtractor === "auto" ? "自动选择" : selectedExtractor,
        })
      } else {
        throw new Error(result.error?.message || "视频解析失败")
      }
    } catch (error) {
      console.error("Analysis failed:", error)
      setAnalysisResult({
        success: false,
        error: error instanceof Error ? error.message : "解析失败，请检查链接是否正确",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const isRestrictedPlatform = (hostname: string): boolean => {
    const restrictedPlatforms = ["douyin.com", "tiktok.com", "kuaishou.com", "ks.com"]
    return restrictedPlatforms.some((platform) => hostname.includes(platform))
  }

  const getRestrictedPlatformMessage = (hostname: string): string => {
    if (hostname.includes("douyin.com") || hostname.includes("tiktok.com")) {
      return "抖音/TikTok平台由于技术限制（动态URL、防盗链机制）暂不支持解析。建议使用官方应用的保存功能。"
    } else if (hostname.includes("kuaishou.com") || hostname.includes("ks.com")) {
      return "快手平台由于视频URL加密和防盗链机制暂不支持解析。建议使用快手官方的下载功能。"
    }
    return "该平台暂不支持解析"
  }

  const handleDownload = async (quality?: string, format?: string) => {
    if (!analysisResult?.success || !analysisResult.video) return

    try {
      const downloadId = await videoDownloader.startDownload(
        url,
        {
          quality: quality || selectedQuality,
          format: format || selectedFormat,
          extractor: selectedExtractor === "auto" ? undefined : selectedExtractor,
        },
        (progress) => {
          addDownload({
            id: progress.id,
            title: progress.title,
            platform: analysisResult.video!.platform,
            progress: progress.progress,
            status: progress.status as any,
            quality: quality || selectedQuality,
            format: format || selectedFormat,
          })
        },
      )

      addDownload({
        id: downloadId,
        title: analysisResult.video.title,
        platform: analysisResult.video.platform,
        progress: 0,
        status: "pending",
        quality: quality || selectedQuality,
        format: format || selectedFormat,
      })
    } catch (error) {
      console.error("Download failed:", error)
      alert(`下载失败: ${error instanceof Error ? error.message : "未知错误"}`)
    }
  }

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    } else {
      return `${minutes}:${secs.toString().padStart(2, "0")}`
    }
  }

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return "未知大小"

    const units = ["B", "KB", "MB", "GB"]
    let size = bytes
    let unitIndex = 0

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`
  }

  return (
    <div className="flex-1 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* URL输入区域 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              视频解析
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                多引擎支持
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="请输入视频链接 (支持 YouTube, B站, Vimeo 等平台)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1"
                onKeyPress={(e) => e.key === "Enter" && handleAnalyze()}
              />
              <Button onClick={handleAnalyze} disabled={isAnalyzing || !url.trim()} className="px-6">
                {isAnalyzing ? "解析中..." : "解析"}
              </Button>
            </div>

            {/* 下载选项 */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">提取引擎</label>
                <Select value={selectedExtractor} onValueChange={setSelectedExtractor}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">自动选择</SelectItem>
                    {availableExtractors.map((extractor) => (
                      <SelectItem key={extractor.name} value={extractor.name}>
                        {extractor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">视频质量</label>
                <Select value={selectedQuality} onValueChange={setSelectedQuality}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="best">最佳质量</SelectItem>
                    <SelectItem value="2160p">4K (2160p)</SelectItem>
                    <SelectItem value="1440p">2K (1440p)</SelectItem>
                    <SelectItem value="1080p">Full HD (1080p)</SelectItem>
                    <SelectItem value="720p">HD (720p)</SelectItem>
                    <SelectItem value="480p">SD (480p)</SelectItem>
                    <SelectItem value="worst">最低质量</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">输出格式</label>
                <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mp4">MP4</SelectItem>
                    <SelectItem value="mkv">MKV</SelectItem>
                    <SelectItem value="webm">WebM</SelectItem>
                    <SelectItem value="avi">AVI</SelectItem>
                    <SelectItem value="mp3">MP3 (仅音频)</SelectItem>
                    <SelectItem value="m4a">M4A (仅音频)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 平台支持信息按钮 */}
            <div className="flex justify-between items-center">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-gray-500">推荐平台:</span>
                <Badge variant="secondary" className="text-xs">
                  YouTube
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  Bilibili
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  Vimeo
                </Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPlatformInfo(!showPlatformInfo)}
                className="flex items-center gap-2"
              >
                <Info className="w-4 h-4" />
                平台支持详情
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 平台支持信息 */}
        {showPlatformInfo && <PlatformSupportInfo />}

        {/* 解析结果 */}
        {analysisResult && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {analysisResult.success ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    解析成功
                    {analysisResult.extractor && (
                      <Badge variant="outline" className="text-xs">
                        {analysisResult.extractor}
                      </Badge>
                    )}
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    解析失败
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analysisResult.success && analysisResult.video ? (
                <div className="space-y-4">
                  {/* 视频信息 */}
                  <div className="flex gap-4">
                    <img
                      src={analysisResult.video.thumbnail || "/placeholder.svg?height=180&width=320"}
                      alt={analysisResult.video.title}
                      className="w-48 h-28 object-cover rounded-lg"
                    />
                    <div className="flex-1 space-y-2">
                      <h3 className="font-semibold text-lg">{analysisResult.video.title}</h3>
                      {analysisResult.video.author && (
                        <p className="text-sm text-gray-600">作者: {analysisResult.video.author}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <Badge variant="outline">{analysisResult.video.platform}</Badge>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatDuration(analysisResult.video.duration)}
                        </div>
                      </div>
                      {analysisResult.video.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">{analysisResult.video.description}</p>
                      )}
                    </div>
                  </div>

                  {/* 可用格式 */}
                  {analysisResult.formats && analysisResult.formats.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium">可用格式:</h4>
                      <div className="grid gap-3">
                        {analysisResult.formats.map((format, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                          >
                            <div className="flex items-center gap-3">
                              <Play className="w-4 h-4 text-gray-400" />
                              <div>
                                <div className="font-medium">{format.quality}</div>
                                <div className="text-sm text-gray-500">
                                  {format.format.toUpperCase()} • {formatFileSize(format.size)}
                                </div>
                              </div>
                            </div>
                            <Button size="sm" onClick={() => handleDownload(format.quality, format.format)}>
                              下载
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 快速下载按钮 */}
                  <div className="flex gap-2">
                    <Button onClick={() => handleDownload()} className="flex-1">
                      <Download className="w-4 h-4 mr-2" />
                      使用当前设置下载
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-red-700 mb-2">解析失败</h3>
                  <p className="text-red-600">{analysisResult.error}</p>
                  <div className="mt-4 text-sm text-gray-600">
                    <p>可能的原因:</p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>视频链接格式不正确</li>
                      <li>视频已被删除或设为私有</li>
                      <li>平台暂时不可访问</li>
                      <li>需要登录才能访问</li>
                      <li>平台有技术限制（如抖音、快手）</li>
                    </ul>
                    <p className="mt-2 text-blue-600">建议尝试YouTube、Bilibili、Vimeo等支持较好的平台</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
