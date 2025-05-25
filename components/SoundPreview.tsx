"use client"

import { Button } from "@/components/ui/button"
import { Pause, Play } from "lucide-react"
import { useRef, useState } from "react"

interface SoundPreviewProps {
  url: string
}

export function SoundPreview({ url }: SoundPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const togglePlay = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(url)
      audioRef.current.addEventListener("ended", () => setIsPlaying(false))
    }

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
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
