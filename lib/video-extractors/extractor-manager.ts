import type { BaseVideoExtractor, ExtractRequest, ExtractResponse } from "./base-extractor"
import { YtDlpExtractor } from "./ytdlp-extractor"
import { CobaltExtractor } from "./cobalt-extractor"
import { GalleryDlExtractor } from "./gallery-dl-extractor"
import { SimpleExtractor } from "./simple-extractor"

export class ExtractorManager {
  private extractors: BaseVideoExtractor[] = []
  private fallbackOrder: string[] = ["simple", "yt-dlp", "cobalt", "gallery-dl"]
  private maxRetries = 2

  constructor() {
    this.registerExtractor(new SimpleExtractor()) // 添加简单提取器作为首选
    this.registerExtractor(new YtDlpExtractor())
    this.registerExtractor(new CobaltExtractor())
    this.registerExtractor(new GalleryDlExtractor())
  }

  /**
   * 注册新的提取器
   */
  registerExtractor(extractor: BaseVideoExtractor) {
    this.extractors.push(extractor)
  }

  /**
   * 获取支持指定URL的提取器
   */
  getExtractorsForUrl(url: string): BaseVideoExtractor[] {
    return this.extractors.filter((extractor) => extractor.supports(url))
  }

  /**
   * 获取所有提取器
   */
  getAllExtractors(): BaseVideoExtractor[] {
    return [...this.extractors]
  }

  /**
   * 使用最佳提取器提取视频
   */
  async extract(request: ExtractRequest, preferredExtractor?: string): Promise<ExtractResponse> {
    const supportedExtractors = this.getExtractorsForUrl(request.url)

    if (supportedExtractors.length === 0) {
      return {
        success: false,
        error: {
          code: "NO_EXTRACTOR_FOUND",
          message: "没有找到支持该URL的提取器",
        },
      }
    }

    // 如果指定了首选提取器，优先使用
    if (preferredExtractor && preferredExtractor !== "auto") {
      const preferred = supportedExtractors.find((e) => e.name === preferredExtractor)
      if (preferred) {
        const result = await this.tryExtractWithRetry(preferred, request)
        if (result.success) {
          return result
        }
      }
    }

    // 按照fallback顺序尝试
    const orderedExtractors = this.orderExtractors(supportedExtractors)

    for (const extractor of orderedExtractors) {
      try {
        console.log(`尝试使用 ${extractor.name} 提取器...`)
        const result = await this.tryExtractWithRetry(extractor, request)

        if (result.success) {
          console.log(`${extractor.name} 提取成功`)
          return result
        } else {
          console.warn(`${extractor.name} 提取失败:`, result.error?.message)
        }
      } catch (error) {
        console.error(`${extractor.name} 提取器出错:`, error)
      }
    }

    return {
      success: false,
      error: {
        code: "ALL_EXTRACTORS_FAILED",
        message: "所有提取器都失败了，请检查网络连接或稍后重试",
      },
    }
  }

  /**
   * 带重试的提取方法
   */
  private async tryExtractWithRetry(extractor: BaseVideoExtractor, request: ExtractRequest): Promise<ExtractResponse> {
    let lastError: any

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const result = await extractor.extract(request)
        if (result.success) {
          return result
        }
        lastError = result.error

        // 如果不是网络错误，不重试
        if (result.error?.code !== "NETWORK_ERROR") {
          break
        }
      } catch (error) {
        lastError = error
        console.warn(`${extractor.name} 第 ${attempt} 次尝试失败:`, error)

        // 等待一段时间再重试
        if (attempt < this.maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt))
        }
      }
    }

    return {
      success: false,
      error: {
        code: "EXTRACTOR_FAILED",
        message: lastError?.message || "提取失败",
      },
    }
  }

  /**
   * 批量提取
   */
  async batchExtract(requests: ExtractRequest[]): Promise<ExtractResponse[]> {
    const results = await Promise.allSettled(requests.map((request) => this.extract(request)))

    return results.map((result) =>
      result.status === "fulfilled"
        ? result.value
        : {
            success: false,
            error: {
              code: "BATCH_EXTRACT_FAILED",
              message: "批量提取失败",
            },
          },
    )
  }

  /**
   * 按照优先级排序提取器
   */
  private orderExtractors(extractors: BaseVideoExtractor[]): BaseVideoExtractor[] {
    return extractors.sort((a, b) => {
      const aIndex = this.fallbackOrder.indexOf(a.name)
      const bIndex = this.fallbackOrder.indexOf(b.name)

      const aPriority = aIndex === -1 ? 999 : aIndex
      const bPriority = bIndex === -1 ? 999 : bIndex

      return aPriority - bPriority
    })
  }

  /**
   * 获取支持的平台统计
   */
  getSupportedPlatforms(): { extractor: string; domains: string[] }[] {
    return this.extractors.map((extractor) => ({
      extractor: extractor.name,
      domains: extractor.supportedDomains,
    }))
  }
}

// 创建全局实例
export const extractorManager = new ExtractorManager()
