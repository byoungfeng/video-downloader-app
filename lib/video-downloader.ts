import { extractorManager } from "./video-extractors/extractor-manager"

export interface DownloadOptions {
  quality: string
  format: string
  outputPath?: string
  filename?: string
  extractor?: string
}

export interface DownloadProgress {
  id: string
  url: string
  title: string
  progress: number
  speed: string
  eta: string
  status: "pending" | "downloading" | "completed" | "error" | "paused"
  error?: string
}

export class VideoDownloader {
  private downloads = new Map<string, DownloadProgress>()
  private downloadCallbacks = new Map<string, (progress: DownloadProgress) => void>()

  /**
   * 开始下载视频
   */
  async startDownload(
    url: string,
    options: DownloadOptions,
    onProgress?: (progress: DownloadProgress) => void,
  ): Promise<string> {
    const downloadId = this.generateDownloadId()

    try {
      // 1. 使用 extractorManager 提取视频信息
      const extractResult = await extractorManager.extract(
        {
          url,
          quality: options.quality,
          format: options.format,
        },
        options.extractor,
      )

      if (!extractResult.success || !extractResult.data) {
        throw new Error(extractResult.error?.message || "视频解析失败")
      }

      const { video, formats } = extractResult.data

      // 2. 选择最佳格式
      const selectedFormat = this.selectBestFormat(formats, options)
      if (!selectedFormat) {
        throw new Error("未找到合适的视频格式")
      }

      // 3. 初始化下载进度
      const downloadProgress: DownloadProgress = {
        id: downloadId,
        url,
        title: video.title,
        progress: 0,
        speed: "0 KB/s",
        eta: "--:--",
        status: "pending",
      }

      this.downloads.set(downloadId, downloadProgress)
      if (onProgress) {
        this.downloadCallbacks.set(downloadId, onProgress)
      }

      // 4. 开始实际下载
      this.performDownload(downloadId, selectedFormat, video.title, options)

      return downloadId
    } catch (error) {
      const errorProgress: DownloadProgress = {
        id: downloadId,
        url,
        title: "下载失败",
        progress: 0,
        speed: "0 KB/s",
        eta: "--:--",
        status: "error",
        error: error instanceof Error ? error.message : "未知错误",
      }

      this.downloads.set(downloadId, errorProgress)
      if (onProgress) {
        onProgress(errorProgress)
      }

      throw error
    }
  }

  /**
   * 暂停下载
   */
  pauseDownload(downloadId: string): boolean {
    const download = this.downloads.get(downloadId)
    if (download && download.status === "downloading") {
      download.status = "paused"
      this.downloads.set(downloadId, download)
      this.notifyProgress(downloadId)
      return true
    }
    return false
  }

  /**
   * 恢复下载
   */
  resumeDownload(downloadId: string): boolean {
    const download = this.downloads.get(downloadId)
    if (download && download.status === "paused") {
      download.status = "downloading"
      this.downloads.set(downloadId, download)
      this.notifyProgress(downloadId)
      return true
    }
    return false
  }

  /**
   * 取消下载
   */
  cancelDownload(downloadId: string): boolean {
    const download = this.downloads.get(downloadId)
    if (download) {
      this.downloads.delete(downloadId)
      this.downloadCallbacks.delete(downloadId)
      return true
    }
    return false
  }

  /**
   * 获取下载进度
   */
  getDownloadProgress(downloadId: string): DownloadProgress | null {
    return this.downloads.get(downloadId) || null
  }

  /**
   * 获取所有下载
   */
  getAllDownloads(): DownloadProgress[] {
    return Array.from(this.downloads.values())
  }

  private selectBestFormat(formats: any[], options: DownloadOptions) {
    // 按质量和格式偏好排序
    const sortedFormats = formats.sort((a, b) => {
      // 优先匹配用户指定的格式
      if (a.format === options.format && b.format !== options.format) return -1
      if (b.format === options.format && a.format !== options.format) return 1

      // 按质量排序
      const qualityOrder = ["2160p", "1440p", "1080p", "720p", "480p", "360p"]
      const aIndex = qualityOrder.indexOf(a.quality)
      const bIndex = qualityOrder.indexOf(b.quality)

      if (options.quality === "best") {
        return aIndex - bIndex
      } else if (options.quality === "worst") {
        return bIndex - aIndex
      } else {
        // 匹配指定质量
        if (a.quality === options.quality && b.quality !== options.quality) return -1
        if (b.quality === options.quality && a.quality !== options.quality) return 1
        return aIndex - bIndex
      }
    })

    return sortedFormats[0]
  }

  private async performDownload(downloadId: string, selectedFormat: any, title: string, options: DownloadOptions) {
    try {
      const download = this.downloads.get(downloadId)!
      download.status = "downloading"
      this.notifyProgress(downloadId)

      // 调用后端下载API
      const response = await fetch("/api/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: selectedFormat.url,
          filename: this.generateFilename(title, options.format),
          quality: options.quality,
          format: options.format,
        }),
      })

      if (!response.ok) {
        throw new Error(`下载失败: ${response.statusText}`)
      }

      // 模拟下载进度
      await this.simulateDownloadProgress(downloadId, title, options.format)
    } catch (error) {
      const download = this.downloads.get(downloadId)!
      download.status = "error"
      download.error = error instanceof Error ? error.message : "下载失败"
      this.notifyProgress(downloadId)
    }
  }

  private async simulateDownloadProgress(downloadId: string, title: string, format: string) {
    const download = this.downloads.get(downloadId)!
    const totalSteps = 100
    const stepDelay = 100 // 100ms per step

    for (let step = 0; step <= totalSteps; step++) {
      if (download.status === "paused") {
        return
      }

      download.progress = step
      download.speed = `${(Math.random() * 5 + 1).toFixed(1)} MB/s`
      download.eta = `${Math.max(0, totalSteps - step)}s`

      this.notifyProgress(downloadId)

      if (step === totalSteps) {
        // 下载完成，触发浏览器下载
        this.triggerBrowserDownload(title, format)
        download.status = "completed"
        download.speed = "0 KB/s"
        download.eta = "完成"
        this.notifyProgress(downloadId)
        break
      }

      await new Promise((resolve) => setTimeout(resolve, stepDelay))
    }
  }

  private triggerBrowserDownload(title: string, format: string) {
    // 创建一个示例文件并触发下载
    const filename = this.generateFilename(title, format)
    const content = `# ${title}\n\n这是一个示例下载文件。\n在实际应用中，这里应该是真实的视频文件内容。\n\n下载时间: ${new Date().toLocaleString()}`

    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  private notifyProgress(downloadId: string) {
    const download = this.downloads.get(downloadId)
    const callback = this.downloadCallbacks.get(downloadId)

    if (download && callback) {
      callback(download)
    }
  }

  private generateDownloadId(): string {
    return `download_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateFilename(title: string, format: string): string {
    // 清理文件名中的非法字符
    const cleanTitle = title.replace(/[<>:"/\\|?*]/g, "_").trim()
    return `${cleanTitle}.${format}`
  }
}

// 创建全局下载器实例
export const videoDownloader = new VideoDownloader()
