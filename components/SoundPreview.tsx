// components/SoundPreview.tsx
"use client"

import { Button } from "@/components/ui/button"
import { Pause, Play } from "lucide-react"
import { useEffect, useRef, useState } from "react"

interface SoundPreviewProps {
  url: string
  size?: "default" | "sm" | "lg" | "icon"
}

export function SoundPreview({ url, size = "default" }: SoundPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const togglePlay = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch((err) => {
        console.error("Playback error:", err)
      })
    }
  }

  useEffect(() => {
    const audio = new Audio(url)
    audioRef.current = audio

    const handleEnded = () => setIsPlaying(false)
    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)

    audio.addEventListener("ended", handleEnded)
    audio.addEventListener("play", handlePlay)
    audio.addEventListener("pause", handlePause)

    return () => {
      audio.pause()
      audio.removeEventListener("ended", handleEnded)
      audio.removeEventListener("play", handlePlay)
      audio.removeEventListener("pause", handlePause)
      audio.src = ""
      audioRef.current = null
    }
  }, [url])

  return (
    <Button onClick={togglePlay} className="h-8 w-8 p-0" {...{ variant: "ghost", size }}>
      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
    </Button>
  )
}
