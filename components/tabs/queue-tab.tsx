"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { List, Pause, X, RotateCcw } from "lucide-react"
import { useVideoDownloader } from "../video-downloader-context"

export function QueueTab() {
  const { downloads, updateDownload } = useVideoDownloader()

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500"
      case "downloading":
        return "bg-blue-500"
      case "error":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "等待中"
      case "downloading":
        return "下载中"
      case "completed":
        return "已完成"
      case "error":
        return "错误"
      default:
        return "未知"
    }
  }

  return (
    <div className="flex-1 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <List className="w-5 h-5" />
              下载队列
              <Badge variant="secondary" className="ml-2">
                {downloads.length} 项任务
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {downloads.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <List className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>暂无下载任务</p>
                <p className="text-sm">添加视频链接开始下载</p>
              </div>
            ) : (
              <div className="space-y-4">
                {downloads.map((download) => (
                  <div key={download.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{download.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {download.platform}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {download.quality} • {download.format}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Badge variant="secondary" className={`${getStatusColor(download.status)} text-white`}>
                          {getStatusText(download.status)}
                        </Badge>
                        <div className="flex gap-1">
                          {download.status === "downloading" && (
                            <Button size="sm" variant="outline">
                              <Pause className="w-4 h-4" />
                            </Button>
                          )}
                          {download.status === "error" && (
                            <Button size="sm" variant="outline">
                              <RotateCcw className="w-4 h-4" />
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {download.status === "downloading" && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>下载进度</span>
                          <span>{Math.round(download.progress)}%</span>
                        </div>
                        <Progress value={download.progress} className="h-2" />
                      </div>
                    )}

                    {download.status === "completed" && (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        下载完成 - 保存至下载文件夹
                      </div>
                    )}

                    {download.status === "error" && (
                      <div className="flex items-center gap-2 text-sm text-red-600">
                        <div className="w-2 h-2 bg-red-500 rounded-full" />
                        下载失败 - 请检查网络连接或重试
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
