// Declare the chrome variable to fix lint/correctness/noUndeclaredVariables error
const chrome = window.chrome

class PopupManager {
  constructor() {
    this.currentTab = null
    this.detectedVideos = []
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
    this.bindEvents()
    this.getCurrentTab()
    this.loadStats()
  }

  async loadSettings() {
    const result = await chrome.storage.sync.get(this.settings)
    this.settings = { ...this.settings, ...result }
    this.updateSettingsUI()
  }

  async saveSettings() {
    await chrome.storage.sync.set(this.settings)
  }

  bindEvents() {
    // 设置按钮
    document.getElementById("settingsBtn").addEventListener("click", () => {
      this.showSettings()
    })

    document.getElementById("closeSettingsBtn").addEventListener("click", () => {
      this.hideSettings()
    })

    // 快速操作按钮
    document.getElementById("quickDownloadBtn").addEventListener("click", () => {
      this.quickDownload()
    })

    document.getElementById("openMainAppBtn").addEventListener("click", () => {
      this.openMainApp()
    })

    // 设置项
    document.getElementById("autoDetectVideos").addEventListener("change", (e) => {
      this.settings.autoDetectVideos = e.target.checked
      this.saveSettings()
    })

    document.getElementById("showFloatingButton").addEventListener("change", (e) => {
      this.settings.showFloatingButton = e.target.checked
      this.saveSettings()
      this.updateContentScript()
    })

    document.getElementById("enableNotifications").addEventListener("change", (e) => {
      this.settings.enableNotifications = e.target.checked
      this.saveSettings()
    })

    document.getElementById("defaultQuality").addEventListener("change", (e) => {
      this.settings.defaultQuality = e.target.value
      this.saveSettings()
    })
  }

  async getCurrentTab() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    this.currentTab = tab
    this.analyzeCurrentPage()
  }

  analyzeCurrentPage() {
    if (!this.currentTab) return

    const url = new URL(this.currentTab.url)
    const domain = url.hostname

    // 更新页面信息
    document.getElementById("pageTitle").textContent = this.currentTab.title || "未知页面"
    document.getElementById("pageUrl").textContent = domain

    // 检查平台支持
    const supportedPlatforms = [
      "youtube.com",
      "bilibili.com",
      "douyin.com",
      "twitter.com",
      "instagram.com",
      "vimeo.com",
    ]

    const isSupported = supportedPlatforms.some((platform) => domain.includes(platform))
    const statusBadge = document.getElementById("statusBadge")
    const pageIcon = document.getElementById("pageIcon")

    if (isSupported) {
      statusBadge.className = "status-badge supported"
      statusBadge.textContent = "支持"
      pageIcon.textContent = this.getPlatformIcon(domain)
      this.detectVideos()
    } else {
      statusBadge.className = "status-badge unsupported"
      statusBadge.textContent = "不支持"
      pageIcon.textContent = "🌐"
    }
  }

  getPlatformIcon(domain) {
    if (domain.includes("youtube.com")) return "📺"
    if (domain.includes("bilibili.com")) return "📱"
    if (domain.includes("douyin.com")) return "🎵"
    if (domain.includes("twitter.com")) return "🐦"
    if (domain.includes("instagram.com")) return "📷"
    if (domain.includes("vimeo.com")) return "🎬"
    return "🌐"
  }

  async detectVideos() {
    try {
      // 向内容脚本发送消息检测视频
      const response = await chrome.tabs.sendMessage(this.currentTab.id, {
        action: "detectVideos",
      })

      if (response && response.videos) {
        this.detectedVideos = response.videos
        this.updateVideosUI()
      }
    } catch (error) {
      console.log("Content script not ready, injecting...")
      // 如果内容脚本未准备好，注入它
      await chrome.scripting.executeScript({
        target: { tabId: this.currentTab.id },
        files: ["content.js"],
      })

      // 重试检测
      setTimeout(() => this.detectVideos(), 1000)
    }
  }

  updateVideosUI() {
    const videosSection = document.getElementById("videosSection")
    const videosList = document.getElementById("videosList")
    const videoCount = document.getElementById("videoCount")
    const quickDownloadBtn = document.getElementById("quickDownloadBtn")

    if (this.detectedVideos.length > 0) {
      videosSection.style.display = "block"
      videoCount.textContent = this.detectedVideos.length
      quickDownloadBtn.disabled = false

      videosList.innerHTML = ""
      this.detectedVideos.forEach((video, index) => {
        const videoItem = this.createVideoItem(video, index)
        videosList.appendChild(videoItem)
      })
    } else {
      videosSection.style.display = "none"
      quickDownloadBtn.disabled = true
    }
  }

  createVideoItem(video, index) {
    const item = document.createElement("div")
    item.className = "video-item"

    item.innerHTML = `
      <div class="video-thumbnail">${video.platform === "youtube" ? "📺" : "🎬"}</div>
      <div class="video-info">
        <div class="video-title">${video.title || "未知标题"}</div>
        <div class="video-meta">${video.duration || "--:--"} • ${video.quality || "未知质量"}</div>
      </div>
      <button class="download-btn" data-index="${index}">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7,10 12,15 17,10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
      </button>
    `

    // 绑定下载按钮事件
    const downloadBtn = item.querySelector(".download-btn")
    downloadBtn.addEventListener("click", () => {
      this.downloadVideo(video)
    })

    return item
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
        if (this.settings.enableNotifications) {
          this.showNotification("下载已开始", `正在下载: ${video.title}`)
        }
      } else {
        this.showNotification("下载失败", response.error || "未知错误")
      }
    } catch (error) {
      console.error("Download failed:", error)
      this.showNotification("下载失败", "请确保主应用正在运行")
    }
  }

  async quickDownload() {
    if (this.detectedVideos.length === 0) return

    // 下载第一个检测到的视频
    await this.downloadVideo(this.detectedVideos[0])
  }

  async openMainApp() {
    try {
      // 通过native messaging打开主应用
      await chrome.runtime.sendMessage({
        action: "openMainApp",
        url: this.currentTab.url,
      })
    } catch (error) {
      console.error("Failed to open main app:", error)
      this.showNotification("打开失败", "请确保主应用已安装")
    }
  }

  showSettings() {
    document.getElementById("settingsPanel").style.display = "block"
  }

  hideSettings() {
    document.getElementById("settingsPanel").style.display = "none"
  }

  updateSettingsUI() {
    document.getElementById("autoDetectVideos").checked = this.settings.autoDetectVideos
    document.getElementById("showFloatingButton").checked = this.settings.showFloatingButton
    document.getElementById("enableNotifications").checked = this.settings.enableNotifications
    document.getElementById("defaultQuality").value = this.settings.defaultQuality
  }

  async updateContentScript() {
    if (this.currentTab) {
      try {
        await chrome.tabs.sendMessage(this.currentTab.id, {
          action: "updateSettings",
          settings: this.settings,
        })
      } catch (error) {
        console.log("Content script not available")
      }
    }
  }

  async loadStats() {
    try {
      const stats = await chrome.storage.local.get(["todayDownloads", "successRate"])
      document.getElementById("todayDownloads").textContent = stats.todayDownloads || "0"
      document.getElementById("successRate").textContent = stats.successRate || "--"
    } catch (error) {
      console.error("Failed to load stats:", error)
    }
  }

  showNotification(title, message) {
    // 创建简单的通知显示
    const notification = document.createElement("div")
    notification.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: #1e293b;
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 12px;
      z-index: 1000;
      max-width: 250px;
    `
    notification.innerHTML = `<strong>${title}</strong><br>${message}`

    document.body.appendChild(notification)

    setTimeout(() => {
      notification.remove()
    }, 3000)
  }
}

// 初始化弹出窗口
document.addEventListener("DOMContentLoaded", () => {
  new PopupManager()
})
