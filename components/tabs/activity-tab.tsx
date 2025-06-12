"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, TrendingUp, Shield, Clock } from "lucide-react"

const activityData = [
  {
    time: "14:32:15",
    action: "视频解析成功",
    platform: "Bilibili",
    details: "Next.js 14 完整教程",
    status: "success",
  },
  {
    time: "14:31:45",
    action: "开始下载",
    platform: "YouTube",
    details: "1080p MP4 格式",
    status: "info",
  },
  {
    time: "14:30:22",
    action: "限流检测",
    platform: "System",
    details: "请求频率正常",
    status: "warning",
  },
  {
    time: "14:28:10",
    action: "下载完成",
    platform: "TikTok",
    details: "保存至 /Downloads/Videos/",
    status: "success",
  },
  {
    time: "14:25:33",
    action: "证书验证",
    platform: "System",
    details: "HTTPS 连接安全",
    status: "info",
  },
]

const stats = [
  {
    label: "今日解析",
    value: "23",
    max: "100",
    icon: TrendingUp,
    color: "text-blue-600",
  },
  {
    label: "成功率",
    value: "98.5%",
    icon: Shield,
    color: "text-green-600",
  },
  {
    label: "平均响应",
    value: "2.1s",
    icon: Clock,
    color: "text-orange-600",
  },
]

export function ActivityTab() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "warning":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "error":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
    }
  }

  return (
    <div className="flex-1 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 统计卡片 */}
        <div className="grid grid-cols-3 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">{stat.label}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      {stat.max && <p className="text-xs text-gray-400">/ {stat.max}</p>}
                    </div>
                    <Icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* 活动日志 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              实时活动监控
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activityData.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <div className="text-sm text-gray-500 font-mono min-w-[60px]">{activity.time}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{activity.action}</span>
                      <Badge variant="outline" className="text-xs">
                        {activity.platform}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{activity.details}</p>
                  </div>
                  <Badge className={getStatusColor(activity.status)}>{activity.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 系统状态 */}
        <Card>
          <CardHeader>
            <CardTitle>系统状态</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">CPU 使用率</span>
                  <span className="text-sm font-medium">12%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: "12%" }} />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">内存使用</span>
                  <span className="text-sm font-medium">256MB</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: "25%" }} />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">网络状态</span>
                  <Badge className="bg-green-100 text-green-800">正常</Badge>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">代理状态</span>
                  <Badge className="bg-gray-100 text-gray-800">未启用</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
