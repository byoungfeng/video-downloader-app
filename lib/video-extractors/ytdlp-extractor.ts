import { BaseVideoExtractor, type ExtractRequest, type ExtractResponse } from "./base-extractor"

/**
 * yt-dlp 提取器 - 使用真实的视频信息提取
 */
export class YtDlpExtractor extends BaseVideoExtractor {
  name = "yt-dlp"
  supportedDomains = [
    "youtube.com",
    "youtu.be",
    "bilibili.com",
    "douyin.com",
    "tiktok.com",
    "twitter.com",
    "x.com",
    "instagram.com",
    "vimeo.com",
    "facebook.com",
    "twitch.tv",
  ]

  async extract(request: ExtractRequest): Promise<ExtractResponse> {
    try {
      // 调用后端API进行真实的视频信息提取
      const response = await fetch("/api/extract/ytdlp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: request.url,
          quality: request.quality || "best",
          format: request.format || "mp4",
          extractInfo: true, // 只提取信息，不下载
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success) {
        return {
          success: true,
          data: {
            video: {
              title: this.cleanTitle(data.title || "未知标题"),
              description: data.description,
              duration: this.formatDuration(data.duration || 0),
              thumbnail: data.thumbnail || "/placeholder.svg?height=180&width=320",
              author: data.uploader || data.channel,
              publishTime: data.upload_date,
              viewCount: data.view_count,
              platform: this.getPlatform(request.url),
            },
            formats: this.processFormats(data.formats || []),
            extractTime: Date.now(),
          },
        }
      } else {
        throw new Error(data.error || "解析失败")
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: "YTDLP_EXTRACT_FAILED",
          message: error instanceof Error ? error.message : "提取失败",
        },
      }
    }
  }

  private processFormats(formats: any[]) {
    return formats
      .filter((f) => f.url && (f.vcodec !== "none" || f.acodec !== "none"))
      .map((format) => ({
        quality: format.height ? `${format.height}p` : format.format_note || "未知",
        format: format.ext || "mp4",
        url: format.url,
        size: format.filesize,
        bitrate: format.tbr,
        codec: format.vcodec !== "none" ? format.vcodec : format.acodec,
        fps: format.fps,
      }))
      .sort((a, b) => {
        const qualityOrder = ["2160p", "1440p", "1080p", "720p", "480p", "360p", "240p"]
        const aIndex = qualityOrder.indexOf(a.quality)
        const bIndex = qualityOrder.indexOf(b.quality)
        return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex)
      })
  }
}
