import { BaseVideoExtractor, type ExtractRequest, type ExtractResponse } from "./base-extractor"

/**
 * gallery-dl 提取器 - 专注于图片和媒体下载
 * 特别适合Instagram、Twitter等社交媒体平台
 */
export class GalleryDlExtractor extends BaseVideoExtractor {
  name = "gallery-dl"
  supportedDomains = [
    "instagram.com",
    "twitter.com",
    "x.com",
    "reddit.com",
    "pixiv.net",
    "deviantart.com",
    "tumblr.com",
  ]

  async extract(request: ExtractRequest): Promise<ExtractResponse> {
    try {
      const response = await fetch("/api/extract/gallery-dl", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: request.url,
          options: request.options || {},
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success && data.files && data.files.length > 0) {
        const firstFile = data.files[0]

        return {
          success: true,
          data: {
            video: {
              title: this.cleanTitle(firstFile.filename || "未知标题"),
              description: firstFile.description || "",
              duration: 0,
              thumbnail: firstFile.thumbnail || "",
              author: firstFile.username || "",
              platform: this.getPlatform(request.url),
            },
            formats: data.files.map((file: any) => ({
              quality: file.width ? `${file.width}x${file.height}` : "未知",
              format: file.extension || "mp4",
              url: file.url,
              size: file.size,
              bitrate: undefined,
              codec: undefined,
            })),
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
          code: "GALLERY_DL_EXTRACT_FAILED",
          message: error instanceof Error ? error.message : "提取失败",
        },
      }
    }
  }
}
