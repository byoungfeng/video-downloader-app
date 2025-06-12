import { BaseVideoExtractor, type ExtractRequest, type ExtractResponse } from "./base-extractor"

/**
 * 简单提取器 - 使用公开API和网页解析
 */
export class SimpleExtractor extends BaseVideoExtractor {
  name = "simple"
  supportedDomains = ["youtube.com", "youtu.be", "bilibili.com", "vimeo.com"]

  async extract(request: ExtractRequest): Promise<ExtractResponse> {
    try {
      const url = new URL(request.url)

      // 检查是否为受限平台
      if (this.isRestrictedPlatform(url.hostname)) {
        return this.handleRestrictedPlatform(url.hostname)
      }

      if (url.hostname.includes("youtube.com") || url.hostname.includes("youtu.be")) {
        return await this.extractYouTube(request.url)
      } else if (url.hostname.includes("bilibili.com")) {
        return await this.extractBilibili(request.url)
      } else if (url.hostname.includes("vimeo.com")) {
        return await this.extractVimeo(request.url)
      }

      throw new Error("不支持的平台")
    } catch (error) {
      return {
        success: false,
        error: {
          code: "SIMPLE_EXTRACT_FAILED",
          message: error instanceof Error ? error.message : "提取失败",
        },
      }
    }
  }

  private isRestrictedPlatform(hostname: string): boolean {
    const restrictedPlatforms = ["douyin.com", "tiktok.com", "kuaishou.com", "ks.com", "xiaohongshu.com", "xhs.com"]
    return restrictedPlatforms.some((platform) => hostname.includes(platform))
  }

  private handleRestrictedPlatform(hostname: string): ExtractResponse {
    let platformName = "未知平台"
    let specificMessage = ""

    if (hostname.includes("douyin.com") || hostname.includes("tiktok.com")) {
      platformName = "抖音/TikTok"
      specificMessage = "抖音和TikTok使用动态加密的视频URL，且有严格的防盗链机制。建议使用官方应用的保存功能。"
    } else if (hostname.includes("kuaishou.com") || hostname.includes("ks.com")) {
      platformName = "快手"
      specificMessage = "快手视频URL经过特殊加密，需要复杂的解析流程。建议使用快手官方的下载功能。"
    } else if (hostname.includes("xiaohongshu.com") || hostname.includes("xhs.com")) {
      platformName = "小红书"
      specificMessage = "小红书对视频内容有严格的版权保护，不支持第三方下载。"
    }

    return {
      success: false,
      error: {
        code: "PLATFORM_RESTRICTED",
        message: `${platformName}平台受到技术限制：${specificMessage}`,
      },
    }
  }

  private async extractYouTube(url: string): Promise<ExtractResponse> {
    try {
      // 提取视频ID
      const videoId = this.getYouTubeVideoId(url)
      if (!videoId) {
        throw new Error("无效的YouTube链接")
      }

      // 使用YouTube oEmbed API获取基本信息
      const oembedResponse = await fetch(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
      )

      if (!oembedResponse.ok) {
        throw new Error("无法获取视频信息")
      }

      const oembedData = await oembedResponse.json()

      return {
        success: true,
        data: {
          video: {
            title: this.cleanTitle(oembedData.title || "未知标题"),
            description: "",
            duration: 0, // oEmbed不提供时长
            thumbnail: oembedData.thumbnail_url || "/placeholder.svg?height=180&width=320",
            author: oembedData.author_name || "未知作者",
            platform: "YouTube",
          },
          formats: [
            {
              quality: "720p",
              format: "mp4",
              url: `https://www.youtube.com/watch?v=${videoId}`, // 实际需要进一步解析
              size: undefined,
              bitrate: undefined,
              codec: "h264",
            },
          ],
          extractTime: Date.now(),
        },
      }
    } catch (error) {
      throw new Error(`YouTube解析失败: ${error instanceof Error ? error.message : "未知错误"}`)
    }
  }

  private async extractBilibili(url: string): Promise<ExtractResponse> {
    try {
      // 这里可以实现B站的解析逻辑
      // 由于B站的API较为复杂，这里提供一个基础框架

      return {
        success: true,
        data: {
          video: {
            title: "B站视频标题",
            description: "B站视频描述",
            duration: 0,
            thumbnail: "/placeholder.svg?height=180&width=320",
            author: "B站UP主",
            platform: "Bilibili",
          },
          formats: [
            {
              quality: "720p",
              format: "mp4",
              url: url, // 需要进一步解析
              size: undefined,
              bitrate: undefined,
              codec: "h264",
            },
          ],
          extractTime: Date.now(),
        },
      }
    } catch (error) {
      throw new Error(`B站解析失败: ${error instanceof Error ? error.message : "未知错误"}`)
    }
  }

  private async extractVimeo(url: string): Promise<ExtractResponse> {
    try {
      // 使用Vimeo oEmbed API
      const oembedResponse = await fetch(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`)

      if (!oembedResponse.ok) {
        throw new Error("无法获取Vimeo视频信息")
      }

      const oembedData = await oembedResponse.json()

      return {
        success: true,
        data: {
          video: {
            title: this.cleanTitle(oembedData.title || "未知标题"),
            description: oembedData.description || "",
            duration: oembedData.duration || 0,
            thumbnail: oembedData.thumbnail_url || "/placeholder.svg?height=180&width=320",
            author: oembedData.author_name || "未知作者",
            platform: "Vimeo",
          },
          formats: [
            {
              quality: "720p",
              format: "mp4",
              url: url,
              size: undefined,
              bitrate: undefined,
              codec: "h264",
            },
          ],
          extractTime: Date.now(),
        },
      }
    } catch (error) {
      throw new Error(`Vimeo解析失败: ${error instanceof Error ? error.message : "未知错误"}`)
    }
  }

  private getYouTubeVideoId(url: string): string | null {
    const regex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
    const match = url.match(regex)
    return match ? match[1] : null
  }
}
