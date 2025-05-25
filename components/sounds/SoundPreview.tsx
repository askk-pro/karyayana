"use client"

import { Button } from "@/components/ui/button"
import { Pause, Play } from "lucide-react"
import { useEffect, useRef, useState } from "react"

interface SoundPreviewProps {
  url: string
  volume?: number
  startTime?: number
  endTime?: number
}

export function SoundPreview({ url, volume = 1, startTime = 0, endTime }: SoundPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, volume))
    }
  }, [volume])

  const togglePlay = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(url)
      audioRef.current.volume = Math.max(0, Math.min(1, volume))

      audioRef.current.addEventListener("ended", () => setIsPlaying(false))
      audioRef.current.addEventListener("timeupdate", () => {
        if (endTime && audioRef.current && audioRef.current.currentTime >= endTime) {
          audioRef.current.pause()
          audioRef.current.currentTime = startTime
          setIsPlaying(false)
        }
      })
    }

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.currentTime = startTime
      audioRef.current.play().catch(console.error)
      setIsPlaying(true)
    }
  }

  return (
    <Button
      onClick={togglePlay}
      variant="ghost"
      size="sm"
      className="h-8 w-8 p-0 hover:bg-orange-100 dark:hover:bg-orange-900"
    >
      {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
    </Button>
  )
}
