"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface VideoInfo {
  id: string
  title: string
  platform: string
  duration: string
  thumbnail: string
  url: string
  formats: Array<{
    quality: string
    format: string
    size: string
  }>
}

interface DownloadItem {
  id: string
  title: string
  platform: string
  progress: number
  status: "pending" | "downloading" | "completed" | "error"
  quality: string
  format: string
}

interface VideoDownloaderContextType {
  currentVideo: VideoInfo | null
  setCurrentVideo: (video: VideoInfo | null) => void
  downloads: DownloadItem[]
  addDownload: (item: DownloadItem) => void
  updateDownload: (id: string, updates: Partial<DownloadItem>) => void
  activeTab: string
  setActiveTab: (tab: string) => void
}

const VideoDownloaderContext = createContext<VideoDownloaderContextType | undefined>(undefined)

export function VideoDownloaderProvider({ children }: { children: ReactNode }) {
  const [currentVideo, setCurrentVideo] = useState<VideoInfo | null>(null)
  const [downloads, setDownloads] = useState<DownloadItem[]>([])
  const [activeTab, setActiveTab] = useState("download")

  const addDownload = (item: DownloadItem) => {
    setDownloads((prev) => [...prev, item])
  }

  const updateDownload = (id: string, updates: Partial<DownloadItem>) => {
    setDownloads((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)))
  }

  return (
    <VideoDownloaderContext.Provider
      value={{
        currentVideo,
        setCurrentVideo,
        downloads,
        addDownload,
        updateDownload,
        activeTab,
        setActiveTab,
      }}
    >
      {children}
    </VideoDownloaderContext.Provider>
  )
}

export function useVideoDownloader() {
  const context = useContext(VideoDownloaderContext)
  if (context === undefined) {
    throw new Error("useVideoDownloader must be used within a VideoDownloaderProvider")
  }
  return context
}
