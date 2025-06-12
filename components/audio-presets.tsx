"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Music, Headphones, Mic, Volume2, Podcast } from "lucide-react"

interface AudioPresetProps {
  onSelect: (preset: {
    extractor: string
    quality: string
    format: string
    name: string
    description: string
  }) => void
}

export function AudioPresets({ onSelect }: AudioPresetProps) {
  const presets = [
    {
      name: "高品质音乐",
      description: "yt-dlp + 最佳质量 + MP3",
      extractor: "yt-dlp",
      quality: "best",
      format: "mp3",
      icon: Music,
    },
    {
      name: "播客音频",
      description: "yt-dlp + 最佳质量 + M4A",
      extractor: "yt-dlp",
      quality: "best",
      format: "m4a",
      icon: Podcast,
    },
    {
      name: "语音提取",
      description: "yt-dlp + 中等质量 + MP3",
      extractor: "yt-dlp",
      quality: "480p",
      format: "mp3",
      icon: Mic,
    },
    {
      name: "音频节省空间",
      description: "yt-dlp + 最低质量 + MP3",
      extractor: "yt-dlp",
      quality: "worst",
      format: "mp3",
      icon: Volume2,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Headphones className="w-5 h-5" />
          音频下载预设
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {presets.map((preset) => {
            const Icon = preset.icon
            return (
              <Button
                key={preset.name}
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => onSelect(preset)}
              >
                <Icon className="w-6 h-6 text-purple-600" />
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
