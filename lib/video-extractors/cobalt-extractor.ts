import { BaseVideoExtractor, type ExtractRequest, type ExtractResponse } from "./base-extractor"

/**
 * Cobalt 提取器 - 现代化的视频下载API
 * 支持多个主流平台，界面友好
 */
export class CobaltExtractor extends BaseVideoExtractor {
  name = "cobalt"
  supportedDomains = [
    "youtube.com",
    "youtu.be",
    "twitter.com",
    "x.com",
    "tiktok.com",
    "instagram.com",
    "vimeo.com",
    "reddit.com",
    "soundcloud.com",
  ]

  private baseUrl = "https://co.wuk.sh/api/json"

  async extract(request: ExtractRequest): Promise<ExtractResponse> {
    try {
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          url: request.url,
          vQuality: this.mapQuality(request.quality || "best"),
          vCodec: request.format === "mp4" ? "h264" : "vp9",
          vFormat: request.format || "mp4",
          aFormat: "mp3",
          isAudioOnly: request.format === "mp3",
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.status === "success" || data.status === "redirect") {
        return {
          success: true,
          data: {
            video: {
              title: this.cleanTitle(data.filename || "未知标题"),
              description: "",
              duration: 0, // Cobalt 通常不返回时长
              thumbnail: "",
              author: "",
              platform: this.getPlatform(request.url),
            },
            formats: [
              {
                quality: request.quality || "best",
                format: request.format || "mp4",
                url: data.url,
                size: undefined,
                bitrate: undefined,
                codec: undefined,
              },
            ],
            extractTime: Date.now(),
          },
        }
      } else {
        throw new Error(data.text || "解析失败")
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: "COBALT_EXTRACT_FAILED",
          message: error instanceof Error ? error.message : "提取失败",
        },
      }
    }
  }

  private mapQuality(quality: string): string {
    const qualityMap: Record<string, string> = {
      best: "max",
      "2160p": "max",
      "1440p": "1440",
      "1080p": "1080",
      "720p": "720",
      "480p": "480",
      "360p": "360",
      worst: "360",
    }
    return qualityMap[quality] || "max"
  }
}
