"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Folder, Shield, Zap, Globe } from "lucide-react"

export function SettingsTab() {
  return (
    <div className="flex-1 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 下载设置 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Folder className="w-5 h-5" />
              下载设置
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="download-path">下载路径</Label>
              <div className="flex gap-2">
                <Input id="download-path" value="/Users/username/Downloads/Videos" readOnly className="flex-1" />
                <Button variant="outline">浏览</Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>默认视频质量</Label>
                <Select defaultValue="1080p">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2160p">4K (2160p)</SelectItem>
                    <SelectItem value="1440p">2K (1440p)</SelectItem>
                    <SelectItem value="1080p">Full HD (1080p)</SelectItem>
                    <SelectItem value="720p">HD (720p)</SelectItem>
                    <SelectItem value="480p">SD (480p)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>默认格式</Label>
                <Select defaultValue="mp4">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mp4">MP4</SelectItem>
                    <SelectItem value="mkv">MKV</SelectItem>
                    <SelectItem value="webm">WebM</SelectItem>
                    <SelectItem value="avi">AVI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <Label>并发下载数量: 3</Label>
              <Slider defaultValue={[3]} max={8} min={1} step={1} className="w-full" />
              <p className="text-sm text-gray-500">同时下载的最大任务数量 (1-8)</p>
            </div>
          </CardContent>
        </Card>

        {/* 网络设置 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              网络设置
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label>启用代理</Label>
                <p className="text-sm text-gray-500">通过代理服务器下载</p>
              </div>
              <Switch />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="proxy-host">代理地址</Label>
                <Input id="proxy-host" placeholder="127.0.0.1" disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="proxy-port">端口</Label>
                <Input id="proxy-port" placeholder="7890" disabled />
              </div>
            </div>

            <div className="space-y-3">
              <Label>请求间隔 (秒): 2</Label>
              <Slider defaultValue={[2]} max={10} min={0.5} step={0.5} className="w-full" />
              <p className="text-sm text-gray-500">防止被平台限流的请求间隔时间</p>
            </div>
          </CardContent>
        </Card>

        {/* 安全设置 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              安全设置
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label>启用证书锁定</Label>
                <p className="text-sm text-gray-500">防止中间人攻击</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>沙箱模式</Label>
                <p className="text-sm text-gray-500">限制文件系统访问权限</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>自动更新</Label>
                <p className="text-sm text-gray-500">自动检查并安装更新</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800 dark:text-yellow-200">法律声明</h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    本工具仅用于合法授权的视频内容下载，使用者应确保已获得版权方授权。
                    连续24小时内解析请求超过100次将自动触发限流机制。
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 性能设置 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              性能设置
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label>硬件加速</Label>
                <p className="text-sm text-gray-500">使用GPU加速视频处理</p>
              </div>
              <Switch />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>智能缓存</Label>
                <p className="text-sm text-gray-500">缓存视频元数据以提高速度</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="space-y-3">
              <Label>缓存大小限制 (GB): 2</Label>
              <Slider defaultValue={[2]} max={10} min={0.5} step={0.5} className="w-full" />
            </div>

            <div className="flex gap-2">
              <Button variant="outline">清理缓存</Button>
              <Button variant="outline">重置设置</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
