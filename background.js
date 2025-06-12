// Declare the chrome variable to fix the lint/correctness/noUndeclaredVariables error
const chrome = window.chrome

class BackgroundService {
  constructor() {
    this.init()
  }

  init() {
    this.setupMessageListener()
    this.setupContextMenus()
    this.initializeStats()
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      switch (request.action) {
        case "downloadVideo":
          this.handleDownloadVideo(request.video, request.quality)
            .then((result) => sendResponse(result))
            .catch((error) => sendResponse({ success: false, error: error.message }))
          return true // 保持消息通道开放

        case "openMainApp":
          this.handleOpenMainApp(request.url)
            .then((result) => sendResponse(result))
            .catch((error) => sendResponse({ success: false, error: error.message }))
          return true

        default:
          sendResponse({ error: "Unknown action" })
      }
    })
  }

  setupContextMenus() {
    chrome.runtime.onInstalled.addListener(() => {
      // 创建右键菜单
      chrome.contextMenus.create({
        id: "downloadVideo",
        title: "下载视频",
        contexts: ["video"],
        documentUrlPatterns: [
          "https://www.youtube.com/*",
          "https://www.bilibili.com/*",
          "https://www.douyin.com/*",
          "https://twitter.com/*",
          "https://www.instagram.com/*",
          "https://vimeo.com/*",
        ],
      })

      chrome.contextMenus.create({
        id: "downloadPage",
        title: "检测页面视频",
        contexts: ["page"],
        documentUrlPatterns: [
          "https://www.youtube.com/*",
          "https://www.bilibili.com/*",
          "https://www.douyin.com/*",
          "https://twitter.com/*",
          "https://www.instagram.com/*",
          "https://vimeo.com/*",
        ],
      })
    })

    chrome.contextMenus.onClicked.addListener((info, tab) => {
      switch (info.menuItemId) {
        case "downloadVideo":
          this.handleContextMenuDownload(info, tab)
          break
        case "downloadPage":
          this.handlePageDetection(tab)
          break
      }
    })
  }

  async handleDownloadVideo(video, quality) {
    try {
      // 尝试通过native messaging与主应用通信
      const response = await this.sendToMainApp({
        action: "download",
        video: video,
        quality: quality,
        timestamp: Date.now(),
      })

      if (response && response.success) {
        // 更新统计信息
        await this.updateStats("download")

        // 显示通知
        chrome.notifications.create({
          type: "basic",
          iconUrl: "icons/icon48.png",
          title: "下载已开始",
          message: `正在下载: ${video.title}`,
        })

        return { success: true }
      } else {
        throw new Error(response?.error || "主应用通信失败")
      }
    } catch (error) {
      console.error("Download failed:", error)

      // 更新失败统计
      await this.updateStats("failed")

      return {
        success: false,
        error: "请确保主应用正在运行并已正确配置",
      }
    }
  }

  async handleOpenMainApp(url) {
    try {
      const response = await this.sendToMainApp({
        action: "open",
        url: url,
        timestamp: Date.now(),
      })

      if (response && response.success) {
        return { success: true }
      } else {
        throw new Error("无法打开主应用")
      }
    } catch (error) {
      console.error("Failed to open main app:", error)
      return {
        success: false,
        error: "请确保主应用已安装并正在运行",
      }
    }
  }

  async sendToMainApp(message) {
    return new Promise((resolve, reject) => {
      try {
        // 使用native messaging与主应用通信
        chrome.runtime.sendNativeMessage(
          "com.videodownloader.app", // 主应用的native messaging host ID
          message,
          (response) => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message))
            } else {
              resolve(response)
            }
          },
        )
      } catch (error) {
        reject(error)
      }
    })
  }

  async handleContextMenuDownload(info, tab) {
    try {
      // 获取视频信息
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: this.extractVideoInfo,
        args: [info.srcUrl],
      })

      if (results && results[0] && results[0].result) {
        const video = results[0].result
        await this.handleDownloadVideo(video, "best")
      }
    } catch (error) {
      console.error("Context menu download failed:", error)
    }
  }

  async handlePageDetection(tab) {
    try {
      // 注入内容脚本并检测视频
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content.js"],
      })

      // 发送检测消息
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: "detectVideos",
      })

      if (response && response.videos && response.videos.length > 0) {
        chrome.notifications.create({
          type: "basic",
          iconUrl: "icons/icon48.png",
          title: "视频检测完成",
          message: `检测到 ${response.videos.length} 个视频`,
        })
      }
    } catch (error) {
      console.error("Page detection failed:", error)
    }
  }

  // 在页面中执行的函数，用于提取视频信息
  extractVideoInfo(srcUrl) {
    const video = document.querySelector(`video[src="${srcUrl}"]`) || document.querySelector("video")

    if (video) {
      return {
        platform: window.location.hostname,
        title: document.title || "未知标题",
        url: window.location.href,
        srcUrl: srcUrl,
        duration: video.duration
          ? `${Math.floor(video.duration / 60)}:${Math.floor(video.duration % 60)
              .toString()
              .padStart(2, "0")}`
          : "--:--",
        quality: video.videoHeight ? `${video.videoHeight}p` : "未知",
      }
    }

    return null
  }

  async initializeStats() {
    const today = new Date().toDateString()
    const stats = await chrome.storage.local.get([
      "lastStatsDate",
      "todayDownloads",
      "totalDownloads",
      "successCount",
      "failedCount",
    ])

    // 如果是新的一天，重置今日统计
    if (stats.lastStatsDate !== today) {
      await chrome.storage.local.set({
        lastStatsDate: today,
        todayDownloads: 0,
      })
    }
  }

  async updateStats(type) {
    const stats = await chrome.storage.local.get(["todayDownloads", "totalDownloads", "successCount", "failedCount"])

    const updates = {
      todayDownloads: (stats.todayDownloads || 0) + 1,
      totalDownloads: (stats.totalDownloads || 0) + 1,
    }

    if (type === "download") {
      updates.successCount = (stats.successCount || 0) + 1
    } else if (type === "failed") {
      updates.failedCount = (stats.failedCount || 0) + 1
    }

    // 计算成功率
    const total = updates.successCount + (stats.failedCount || 0)
    if (total > 0) {
      updates.successRate = `${Math.round((updates.successCount / total) * 100)}%`
    }

    await chrome.storage.local.set(updates)
  }
}

// 初始化背景服务
new BackgroundService()
