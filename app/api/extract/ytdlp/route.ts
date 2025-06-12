import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { url, quality, format, extractInfo } = await request.json()

    // 在实际部署中，这里应该调用真实的yt-dlp命令
    // 现在我们提供一个更智能的模拟响应

    const urlObj = new URL(url)
    const platform = getPlatformFromUrl(urlObj.hostname)

    // 根据URL生成更真实的响应
    const mockResponse = await generateMockResponse(url, platform, quality, format)

    // 模拟处理时间
    await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 1500))

    return NextResponse.json(mockResponse)
  } catch (error) {
    console.error("yt-dlp extraction failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "提取失败",
      },
      { status: 500 },
    )
  }
}

function getPlatformFromUrl(hostname: string): string {
  if (hostname.includes("youtube.com") || hostname.includes("youtu.be")) return "youtube"
  if (hostname.includes("bilibili.com")) return "bilibili"
  if (hostname.includes("tiktok.com") || hostname.includes("douyin.com")) return "tiktok"
  if (hostname.includes("twitter.com") || hostname.includes("x.com")) return "twitter"
  if (hostname.includes("instagram.com")) return "instagram"
  if (hostname.includes("vimeo.com")) return "vimeo"
  return "unknown"
}

async function generateMockResponse(url: string, platform: string, quality: string, format: string) {
  const baseFormats = [
    {
      url: `https://example.com/${platform}_1080p.mp4`,
      ext: "mp4",
      height: 1080,
      format_note: "1080p",
      filesize: 85000000,
      tbr: 2500,
      vcodec: "h264",
      fps: 30,
    },
    {
      url: `https://example.com/${platform}_720p.mp4`,
      ext: "mp4",
      height: 720,
      format_note: "720p",
      filesize: 45000000,
      tbr: 1500,
      vcodec: "h264",
      fps: 30,
    },
    {
      url: `https://example.com/${platform}_480p.mp4`,
      ext: "mp4",
      height: 480,
      format_note: "480p",
      filesize: 25000000,
      tbr: 1000,
      vcodec: "h264",
      fps: 30,
    },
  ]

  // 如果请求音频格式，添加音频选项
  if (format === "mp3" || format === "m4a") {
    baseFormats.push({
      url: `https://example.com/${platform}_audio.${format}`,
      ext: format,
      height: 0,
      format_note: "audio only",
      filesize: 8500000,
      tbr: 128,
      vcodec: "none",
      fps: 0,
    })
  }

  const platformData = {
    youtube: {
      title: "【完整教程】现代前端开发技术栈详解",
      description: "从基础到进阶，全面讲解现代前端开发所需的技术栈，包括React、Vue、TypeScript等。",
      duration: 2400,
      uploader: "前端技术分享",
      view_count: 25680,
    },
    bilibili: {
      title: "React 18 新特性深度解析",
      description: "详细介绍React 18的并发特性、Suspense改进、自动批处理等新功能。",
      duration: 1800,
      uploader: "技术UP主",
      view_count: 15420,
    },
    tiktok: {
      title: "60秒学会CSS Grid布局",
      description: "快速掌握CSS Grid布局的核心概念和实用技巧。",
      duration: 60,
      uploader: "前端小技巧",
      view_count: 8930,
    },
    default: {
      title: "示例视频内容",
      description: "这是一个示例视频的描述信息。",
      duration: 600,
      uploader: "示例作者",
      view_count: 1000,
    },
  }

  const data = platformData[platform as keyof typeof platformData] || platformData.default

  return {
    success: true,
    title: data.title,
    description: data.description,
    duration: data.duration,
    thumbnail: `/placeholder.svg?height=180&width=320&text=${encodeURIComponent(data.title)}`,
    uploader: data.uploader,
    upload_date: "2024-01-15",
    view_count: data.view_count,
    formats: baseFormats,
  }
}
