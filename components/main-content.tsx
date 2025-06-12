"use client"

import { useVideoDownloader } from "./video-downloader-context"
import { DownloadTab } from "./tabs/download-tab"
import { QueueTab } from "./tabs/queue-tab"
import { ActivityTab } from "./tabs/activity-tab"
import { SettingsTab } from "./tabs/settings-tab"
import { AboutTab } from "./tabs/about-tab"

export function MainContent() {
  const { activeTab } = useVideoDownloader()

  const renderTab = () => {
    switch (activeTab) {
      case "download":
        return <DownloadTab />
      case "queue":
        return <QueueTab />
      case "activity":
        return <ActivityTab />
      case "settings":
        return <SettingsTab />
      case "about":
        return <AboutTab />
      default:
        return <DownloadTab />
    }
  }

  return <div className="flex-1 flex flex-col">{renderTab()}</div>
}
