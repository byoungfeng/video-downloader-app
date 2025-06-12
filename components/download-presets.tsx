"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Music, Video, Download, Headphones, Film, Mic } from "lucide-react"

interface DownloadPresetProps {
  onSelect: (preset: {
    extractor: string
    quality: string
    format: string
    name: string
    description: string
  }) => void
}

export function DownloadPresets({ onSelect }: DownloadPresetProps) {
  const presets = [
    {
      name: "最高画质视频",
      description: "yt-dlp + 最佳质量 + MP4",
      extractor: "yt-dlp",
      quality: "best",
      format: "mp4",
      icon: Film,
    },
    {
      name: "高质量音频",
      description: "yt-dlp + 最佳质量 + MP3",
      extractor: "yt-dlp",
      quality: "best",
      format: "mp3",
      icon: Music,
    },
    {
      name: "移动设备",
      description: "simple + 720p + MP4",
      extractor: "simple",
      quality: "720p",
      format: "mp4",
      icon: Video,
    },
    {
      name: "播客音频",
      description: "yt-dlp + 最佳质量 + M4A",
      extractor: "yt-dlp",
      quality: "best",
      format: "m4a",
      icon: Headphones,
    },
    {
      name: "低带宽",
      description: "yt-dlp + 480p + MP4",
      extractor: "yt-dlp",
      quality: "480p",
      format: "mp4",
      icon: Download,
    },
    {
      name: "语音提取",
      description: "yt-dlp + 最低质量 + MP3",
      extractor: "yt-dlp",
      quality: "worst",
      format: "mp3",
      icon: Mic,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>快速预设</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {presets.map((preset) => {
            const Icon = preset.icon
            return (
              <Button
                key={preset.name}
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => onSelect(preset)}
              >
                <Icon className="w-6 h-6 text-blue-600" />
                <div className="text-center">
                  <div className="font-medium">{preset.name}</div>
                  <div className="text-xs text-gray-500">{preset.description}</div>
                </div>
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
