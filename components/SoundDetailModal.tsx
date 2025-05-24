"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Pause, Play, Trash2 } from "lucide-react"
import { useEffect, useRef, useState } from "react"

interface SoundDetailModalProps {
  sound: {
    id: string
    name: string
    url: string
    created_at: string
    duration?: number
  } | null
  open: boolean
  onClose: () => void
  onDelete: () => void
}

export function SoundDetailModal({ sound, open, onClose, onDelete }: SoundDetailModalProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (!sound?.url || !open) return

    const audio = new Audio(sound.url)
    audioRef.current = audio
    audioRef.current.currentTime = 0

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
      setIsPlaying(false)
    }
  }, [sound?.url, open])

  const togglePlay = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(console.error)
    }
  }

  const formatDuration = (seconds: number = 0) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (!sound) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{sound.name}</DialogTitle>
        </DialogHeader>

        <div className="text-sm text-slate-600">
          <p>Created: {new Date(sound.created_at).toLocaleString()}</p>
          <p>Duration: {formatDuration(sound.duration)}</p>
        </div>

        <div className="flex items-center gap-3 mt-4">
          <Button variant="ghost" size="icon" onClick={togglePlay}>
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </Button>
          <span className="text-sm text-slate-600">Preview sound</span>
        </div>

        <div className="flex justify-between pt-4">
          <Button variant="destructive" onClick={onDelete}>
            <Trash2 className="h-4 w-4 mr-1" /> Delete
          </Button>
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
