"use client"
import { Sidebar } from "@/components/sidebar"
import { MainContent } from "@/components/main-content"
import { VideoDownloaderProvider } from "@/components/video-downloader-context"

export default function Home() {
  return (
    <VideoDownloaderProvider>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <MainContent />
      </div>
    </VideoDownloaderProvider>
  )
}
