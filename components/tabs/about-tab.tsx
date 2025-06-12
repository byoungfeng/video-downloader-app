"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Info, Github, Heart, Shield, Zap, Globe } from "lucide-react"

const features = [
  {
    icon: Shield,
    title: "安全可靠",
    description: "证书锁定、沙箱模式、防滥用机制",
  },
  {
    icon: Zap,
    title: "高性能",
    description: "多线程下载、智能缓存、硬件加速",
  },
  {
    icon: Globe,
    title: "多平台支持",
    description: "YouTube、B站、抖音等6大主流平台",
  },
]

const techStack = ["Electron", "yt-dlp", "Node.js", "TypeScript", "React", "Tailwind CSS"]

export function AboutTab() {
  return (
    <div className="flex-1 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 应用信息 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              应用信息
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-2xl font-bold text-white">VD</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold">视频下载工具</h2>
                <p className="text-gray-500">Video Downloader Pro</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary">v1.0.0 Beta</Badge>
                  <Badge variant="outline">跨平台</Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">版本:</span>
                <span className="ml-2 font-medium">1.0.0 Beta</span>
              </div>
              <div>
                <span className="text-gray-500">构建日期:</span>
                <span className="ml-2 font-medium">2024-01-15</span>
              </div>
              <div>
                <span className="text-gray-500">平台:</span>
                <span className="ml-2 font-medium">Windows, macOS, Linux</span>
              </div>
              <div>
                <span className="text-gray-500">架构:</span>
                <span className="ml-2 font-medium">x64, arm64</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 核心特性 */}
        <Card>
          <CardHeader>
            <CardTitle>核心特性</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                    <Icon className="w-6 h-6 text-blue-600 mt-1" />
                    <div>
                      <h3 className="font-medium">{feature.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">{feature.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* 技术栈 */}
        <Card>
          <CardHeader>
            <CardTitle>技术栈</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {techStack.map((tech, index) => (
                <Badge key={index} variant="outline" className="px-3 py-1">
                  {tech}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 开源信息 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Github className="w-5 h-5" />
              开源信息
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">本项目基于开源协议发布，欢迎社区贡献代码和反馈问题。</p>

            <div className="flex gap-3">
              <Button variant="outline" className="flex items-center gap-2">
                <Github className="w-4 h-4" />
                GitHub 仓库
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                赞助项目
              </Button>
            </div>

            <div className="text-sm text-gray-500 space-y-1">
              <p>• 遵循 MIT 开源协议</p>
              <p>• 欢迎提交 Issue 和 Pull Request</p>
              <p>• 感谢所有贡献者的支持</p>
            </div>
          </CardContent>
        </Card>

        {/* 法律声明 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              法律声明
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-2">重要提醒</h4>
              <div className="text-sm text-amber-700 dark:text-amber-300 space-y-2">
                <p>• 本工具仅用于合法授权的视频内容下载</p>
                <p>• 使用者应确保已获得版权方授权</p>
                <p>• 请遵守各平台的服务条款和使用协议</p>
                <p>• 禁止用于商业用途或侵犯他人版权</p>
                <p>• 连续24小时内解析请求超过100次将自动触发限流机制</p>
              </div>
            </div>

            <p className="text-xs text-gray-500">
              使用本软件即表示您同意遵守相关法律法规和平台规定。 开发者不承担因违规使用而产生的任何法律责任。
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
