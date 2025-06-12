// Declare the chrome variable to fix the lint error
const chrome = window.chrome

class VideoDetector {
  constructor() {
    this.videos = []
    this.floatingButton = null
    this.settings = {
      autoDetectVideos: true,
      showFloatingButton: true,
      enableNotifications: true,
      defaultQuality: "1080p",
    }

    this.init()
  }

  async init() {
    await this.loadSettings()
    this.setupMessageListener()

    if (this.settings.autoDetectVideos) {
      this.startVideoDetection()
    }

    if (this.settings.showFloatingButton) {
      this.createFloatingButton()
    }
  }

  async loadSettings() {
    try {
      const result = await chrome.storage.sync.get(this.settings)
      this.settings = { ...this.settings, ...result }
    } catch (error) {
      console.error("Failed to load settings:", error)
    }
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      switch (request.action) {
        case "detectVideos":
          this.detectVideos().then((videos) => {
            sendResponse({ videos })
          })
          return true // 保持消息通道开放

        case "updateSettings":
          this.settings = { ...this.settings, ...request.settings }
          this.updateUI()
          sendResponse({ success: true })
          break

        default:
          sendResponse({ error: "Unknown action" })
      }
    })
  }

  async detectVideos() {
    this.videos = []
    const currentUrl = window.location.href
    const domain = window.location.hostname

    // 根据不同平台检测视频
    if (domain.includes("youtube.com")) {
      await this.detectYouTubeVideos()
    } else if (domain.includes("bilibili.com")) {
      await this.detectBilibiliVideos()
    } else if (domain.includes("douyin.com")) {
      await this.detectDouyinVideos()
    } else if (domain.includes("twitter.com")) {
      await this.detectTwitterVideos()
    } else if (domain.includes("instagram.com")) {
      await this.detectInstagramVideos()
    } else if (domain.includes("vimeo.com")) {
      await this.detectVimeoVideos()
    }

    this.updateFloatingButton()
    return this.videos
  }

  async detectYouTubeVideos() {
    // YouTube视频检测
    const videoElement = document.querySelector("video")
    if (videoElement) {
      const titleElement = document.querySelector("h1.ytd-video-primary-info-renderer")
      const title = titleElement ? titleElement.textContent.trim() : "未知标题"

      this.videos.push({
        platform: "youtube",
        title: title,
        url: window.location.href,
        thumbnail: this.getYouTubeThumbnail(),
        duration: this.getVideoDuration(videoElement),
        quality: this.getVideoQuality(videoElement),
      })
    }
  }

  async detectBilibiliVideos() {
    // B站视频检测
    const videoElement = document.querySelector("video")
    if (videoElement) {
      const titleElement = document.querySelector(".video-title") || document.querySelector("h1[title]")
      const title = titleElement ? titleElement.getAttribute("title") || titleElement.textContent.trim() : "未知标题"

      this.videos.push({
        platform: "bilibili",
        title: title,
        url: window.location.href,
        thumbnail: this.getBilibiliThumbnail(),
        duration: this.getVideoDuration(videoElement),
        quality: this.getVideoQuality(videoElement),
      })
    }
  }

  async detectDouyinVideos() {
    // 抖音视频检测
    const videoElements = document.querySelectorAll("video")
    videoElements.forEach((video, index) => {
      const container = video.closest('[data-e2e="feed-item"]') || video.parentElement
      const titleElement = container ? container.querySelector('[data-e2e="video-desc"]') : null
      const title = titleElement ? titleElement.textContent.trim() : `抖音视频 ${index + 1}`

      this.videos.push({
        platform: "douyin",
        title: title,
        url: window.location.href,
        thumbnail: video.poster || "",
        duration: this.getVideoDuration(video),
        quality: this.getVideoQuality(video),
      })
    })
  }

  async detectTwitterVideos() {
    // Twitter视频检测
    const videoElements = document.querySelectorAll("video")
    videoElements.forEach((video, index) => {
      const tweetContainer = video.closest('[data-testid="tweet"]')
      const textElement = tweetContainer ? tweetContainer.querySelector('[data-testid="tweetText"]') : null
      const title = textElement ? textElement.textContent.trim().substring(0, 50) + "..." : `Twitter视频 ${index + 1}`

      this.videos.push({
        platform: "twitter",
        title: title,
        url: window.location.href,
        thumbnail: video.poster || "",
        duration: this.getVideoDuration(video),
        quality: this.getVideoQuality(video),
      })
    })
  }

  async detectInstagramVideos() {
    // Instagram视频检测
    const videoElements = document.querySelectorAll("video")
    videoElements.forEach((video, index) => {
      this.videos.push({
        platform: "instagram",
        title: `Instagram视频 ${index + 1}`,
        url: window.location.href,
        thumbnail: video.poster || "",
        duration: this.getVideoDuration(video),
        quality: this.getVideoQuality(video),
      })
    })
  }

  async detectVimeoVideos() {
    // Vimeo视频检测
    const videoElement = document.querySelector("video")
    if (videoElement) {
      const titleElement = document.querySelector(".clip_info-subline--title") || document.querySelector("h1")
      const title = titleElement ? titleElement.textContent.trim() : "未知标题"

      this.videos.push({
        platform: "vimeo",
        title: title,
        url: window.location.href,
        thumbnail: videoElement.poster || "",
        duration: this.getVideoDuration(videoElement),
        quality: this.getVideoQuality(videoElement),
      })
    }
  }

  startVideoDetection() {
    // 页面加载完成后检测
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        setTimeout(() => this.detectVideos(), 1000)
      })
    } else {
      setTimeout(() => this.detectVideos(), 1000)
    }

    // 监听页面变化（SPA应用）
    let lastUrl = location.href
    new MutationObserver(() => {
      const url = location.href
      if (url !== lastUrl) {
        lastUrl = url
        setTimeout(() => this.detectVideos(), 2000)
      }
    }).observe(document, { subtree: true, childList: true })
  }

  createFloatingButton() {
    if (this.floatingButton) return

    this.floatingButton = document.createElement("div")
    this.floatingButton.id = "video-downloader-floating-btn"
    this.floatingButton.innerHTML = `
      <div class="vd-floating-button">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7,10 12,15 17,10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        <span class="vd-video-count">0</span>
      </div>
    `

    this.floatingButton.addEventListener("click", () => {
      this.showDownloadPanel()
    })

    document.body.appendChild(this.floatingButton)
    this.updateFloatingButton()
  }

  updateFloatingButton() {
    if (!this.floatingButton) return

    const countElement = this.floatingButton.querySelector(".vd-video-count")
    const button = this.floatingButton.querySelector(".vd-floating-button")

    if (this.videos.length > 0) {
      countElement.textContent = this.videos.length
      button.classList.add("has-videos")
      this.floatingButton.style.display = "block"
    } else {
      countElement.textContent = "0"
      button.classList.remove("has-videos")
      this.floatingButton.style.display = this.settings.showFloatingButton ? "block" : "none"
    }
  }

  showDownloadPanel() {
    // 创建下载面板
    const panel = document.createElement("div")
    panel.id = "video-downloader-panel"
    panel.innerHTML = `
      <div class="vd-panel">
        <div class="vd-panel-header">
          <h3>检测到的视频 (${this.videos.length})</h3>
          <button class="vd-close-btn">×</button>
        </div>
        <div class="vd-panel-content">
          ${this.videos
            .map(
              (video, index) => `
            <div class="vd-video-item">
              <div class="vd-video-info">
                <div class="vd-video-title">${video.title}</div>
                <div class="vd-video-meta">${video.platform} • ${video.duration || "--:--"}</div>
              </div>
              <button class="vd-download-btn" data-index="${index}">下载</button>
            </div>
          `,
            )
            .join("")}
        </div>
      </div>
    `

    // 绑定事件
    panel.querySelector(".vd-close-btn").addEventListener("click", () => {
      panel.remove()
    })

    panel.querySelectorAll(".vd-download-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const index = Number.parseInt(e.target.dataset.index)
        this.downloadVideo(this.videos[index])
        panel.remove()
      })
    })

    document.body.appendChild(panel)
  }

  async downloadVideo(video) {
    try {
      // 发送下载请求到背景脚本
      const response = await chrome.runtime.sendMessage({
        action: "downloadVideo",
        video: video,
        quality: this.settings.defaultQuality,
      })

      if (response.success) {
        this.showNotification("下载已开始", `正在下载: ${video.title}`)
      } else {
        this.showNotification("下载失败", response.error || "未知错误")
      }
    } catch (error) {
      console.error("Download failed:", error)
      this.showNotification("下载失败", "请确保主应用正在运行")
    }
  }

  updateUI() {
    if (this.settings.showFloatingButton) {
      if (!this.floatingButton) {
        this.createFloatingButton()
      } else {
        this.floatingButton.style.display = "block"
      }
    } else {
      if (this.floatingButton) {
        this.floatingButton.style.display = "none"
      }
    }
  }

  // 辅助方法
  getYouTubeThumbnail() {
    const img = document.querySelector("video").poster
    return img || `https://img.youtube.com/vi/${this.getYouTubeVideoId()}/maxresdefault.jpg`
  }

  getBilibiliThumbnail() {
    const img = document.querySelector("video").poster
    return img || ""
  }

  getYouTubeVideoId() {
    const url = new URL(window.location.href)
    return url.searchParams.get("v") || ""
  }

  getVideoDuration(video) {
    if (video.duration && !isNaN(video.duration)) {
      const minutes = Math.floor(video.duration / 60)
      const seconds = Math.floor(video.duration % 60)
      return `${minutes}:${seconds.toString().padStart(2, "0")}`
    }
    return "--:--"
  }

  getVideoQuality(video) {
    if (video.videoHeight) {
      return `${video.videoHeight}p`
    }
    return "未知"
  }

  showNotification(title, message) {
    if (!this.settings.enableNotifications) return

    const notification = document.createElement("div")
    notification.className = "vd-notification"
    notification.innerHTML = `
      <div class="vd-notification-content">
        <strong>${title}</strong>
        <p>${message}</p>
      </div>
    `

    document.body.appendChild(notification)

    setTimeout(() => {
      notification.classList.add("show")
    }, 100)

    setTimeout(() => {
      notification.classList.remove("show")
      setTimeout(() => notification.remove(), 300)
    }, 3000)
  }
}

// 初始化视频检测器
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    new VideoDetector()
  })
} else {
  new VideoDetector()
}
