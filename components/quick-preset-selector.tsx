"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

interface QuickPresetSelectorProps {
  onSelect: (preset: {
    extractor: string
    quality: string
    format: string
  }) => void
}

export function QuickPresetSelector({ onSelect }: QuickPresetSelectorProps) {
  const [extractor, setExtractor] = useState("yt-dlp")
  const [quality, setQuality] = useState("best")
  const [format, setFormat] = useState("mp4")

  const handleApply = () => {
    onSelect({
      extractor,
      quality,
      format,
    })
  }

  // 获取质量选项的显示名称
  const getQualityDisplayName = (quality: string) => {
    const qualityMap: Record<string, string> = {
      best: "最佳质量",
      "2160p": "4K (2160p)",
      "1440p": "2K (1440p)",
      "1080p": "Full HD (1080p)",
      "720p": "HD (720p)",
      "480p": "SD (480p)",
      worst: "最低质量",
    }
    return qualityMap[quality] || quality
  }

  // 获取格式选项的显示名称
  const getFormatDisplayName = (format: string) => {
    const formatMap: Record<string, string> = {
      mp4: "MP4 视频",
      mkv: "MKV 视频",
      webm: "WebM 视频",
      avi: "AVI 视频",
      mp3: "MP3 (仅音频)",
      m4a: "M4A (仅音频)",
    }
    return formatMap[format] || format
  }

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium text-gray-700 mb-1 block">提取引擎</label>
            <Select value={extractor} onValueChange={setExtractor}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yt-dlp">yt-dlp</SelectItem>
                <SelectItem value="simple">simple</SelectItem>
                <SelectItem value="cobalt">cobalt</SelectItem>
                <SelectItem value="gallery-dl">gallery-dl</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium text-gray-700 mb-1 block">视频质量</label>
            <Select value={quality} onValueChange={setQuality}>
              <SelectTrigger>
                <SelectValue placeholder="选择质量">{getQualityDisplayName(quality)}</SelectValue>
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

          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium text-gray-700 mb-1 block">输出格式</label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger>
                <SelectValue placeholder="选择格式">{getFormatDisplayName(format)}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mp4">MP4 视频</SelectItem>
                <SelectItem value="mkv">MKV 视频</SelectItem>
                <SelectItem value="webm">WebM 视频</SelectItem>
                <SelectItem value="avi">AVI 视频</SelectItem>
                <SelectItem value="mp3">MP3 (仅音频)</SelectItem>
                <SelectItem value="m4a">M4A (仅音频)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="pt-6">
            <Button onClick={handleApply}>应用设置</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
