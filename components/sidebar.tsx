"use client"

import { Download, Settings, Info, List, Activity } from "lucide-react"
import { cn } from "@/lib/utils"
import { useVideoDownloader } from "./video-downloader-context"

const menuItems = [
  { id: "download", label: "下载", icon: Download },
  { id: "queue", label: "下载队列", icon: List },
  { id: "activity", label: "活动监控", icon: Activity },
  { id: "settings", label: "设置", icon: Settings },
  { id: "about", label: "关于", icon: Info },
]

export function Sidebar() {
  const { activeTab, setActiveTab } = useVideoDownloader()

  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">视频下载工具</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">v1.0.0 Beta</p>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                    activeTab === item.id
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700",
                  )}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          <p>今日解析: 23/100</p>
          <p>状态: 正常运行</p>
        </div>
      </div>
    </div>
  )
}
