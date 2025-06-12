"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertTriangle, XCircle, Info } from "lucide-react"

export function PlatformSupportInfo() {
  const platforms = [
    {
      name: "YouTube",
      status: "full",
      description: "完全支持，包括各种质量和格式",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      name: "Bilibili",
      status: "full",
      description: "支持大部分视频，可能需要处理分P视频",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      name: "Vimeo",
      status: "full",
      description: "支持公开视频，私有视频需要权限",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      name: "Twitter/X",
      status: "partial",
      description: "支持部分视频，可能受到API限制",
      icon: AlertTriangle,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      name: "Instagram",
      status: "partial",
      description: "支持公开视频，私有账户需要登录",
      icon: AlertTriangle,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      name: "抖音/TikTok",
      status: "limited",
      description: "技术限制：动态URL、防盗链、地区限制",
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
    {
      name: "快手",
      status: "limited",
      description: "技术限制：加密URL、需要特殊解析",
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "full":
        return <Badge className="bg-green-100 text-green-800">完全支持</Badge>
      case "partial":
        return <Badge className="bg-yellow-100 text-yellow-800">部分支持</Badge>
      case "limited":
        return <Badge className="bg-red-100 text-red-800">受限支持</Badge>
      default:
        return <Badge variant="secondary">未知</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="w-5 h-5" />
          平台支持状况
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {platforms.map((platform) => {
            const Icon = platform.icon
            return (
              <div key={platform.name} className="flex items-start gap-3 p-3 border rounded-lg">
                <div className={`p-2 rounded-full ${platform.bgColor}`}>
                  <Icon className={`w-4 h-4 ${platform.color}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{platform.name}</span>
                    {getStatusBadge(platform.status)}
                  </div>
                  <p className="text-sm text-gray-600">{platform.description}</p>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">关于抖音、快手等平台的技术限制</h4>
          <div className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
            <p>
              • <strong>动态URL</strong>：视频链接经常变化，难以直接解析
            </p>
            <p>
              • <strong>防盗链机制</strong>：平台主动阻止第三方下载
            </p>
            <p>
              • <strong>加密保护</strong>：视频URL经过加密处理
            </p>
            <p>
              • <strong>地区限制</strong>：某些内容仅在特定地区可用
            </p>
            <p>
              • <strong>登录要求</strong>：可能需要登录状态才能访问
            </p>
          </div>
        </div>

        <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
          <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-2">替代解决方案</h4>
          <div className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
            <p>• 使用官方应用的内置下载功能</p>
            <p>• 尝试屏幕录制工具</p>
            <p>• 使用专门的短视频下载工具</p>
            <p>• 联系内容创作者获取原始文件</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
