export interface VideoInfo {
  title: string
  description?: string
  duration: number
  thumbnail: string
  author?: string
  publishTime?: string
  viewCount?: number
  platform: string
}

export interface MediaFormat {
  quality: string
  format: string
  url: string
  size?: number
  bitrate?: number
  codec?: string
  fps?: number
}

export interface ExtractRequest {
  url: string
  quality?: string
  format?: string
  options?: Record<string, any>
}

export interface ExtractResponse {
  success: boolean
  data?: {
    video: VideoInfo
    formats: MediaFormat[]
    extractTime: number
  }
  error?: {
    code: string
    message: string
  }
}

export abstract class BaseVideoExtractor {
  abstract name: string
  abstract supportedDomains: string[]

  abstract extract(request: ExtractRequest): Promise<ExtractResponse>

  /**
   * 检查是否支持该URL
   */
  supports(url: string): boolean {
    try {
      const urlObj = new URL(url)
      return this.supportedDomains.some((domain) => urlObj.hostname.includes(domain))
    } catch {
      return false
    }
  }

  /**
   * 获取平台名称
   */
  getPlatform(url: string): string {
    try {
      const urlObj = new URL(url)
      if (urlObj.hostname.includes("youtube.com") || urlObj.hostname.includes("youtu.be")) return "YouTube"
      if (urlObj.hostname.includes("bilibili.com")) return "Bilibili"
      if (urlObj.hostname.includes("douyin.com") || urlObj.hostname.includes("tiktok.com")) return "TikTok"
      if (urlObj.hostname.includes("twitter.com") || urlObj.hostname.includes("x.com")) return "Twitter"
      if (urlObj.hostname.includes("instagram.com")) return "Instagram"
      if (urlObj.hostname.includes("vimeo.com")) return "Vimeo"
      return "Unknown"
    } catch {
      return "Unknown"
    }
  }

  /**
   * 格式化时长
   */
  protected formatDuration(seconds: number): number {
    return Math.floor(seconds)
  }

  /**
   * 清理标题
   */
  protected cleanTitle(title: string): string {
    return title.replace(/[<>:"/\\|?*]/g, "_").trim()
  }
}
