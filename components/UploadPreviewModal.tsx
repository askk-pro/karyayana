'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Pause, Play } from "lucide-react"
import { useEffect, useRef, useState } from "react"

interface UploadPreviewModalProps {
  file: File | null
  open: boolean
  onClose: () => void
  onConfirm: () => void
}

export function UploadPreviewModal({ file, open, onClose, onConfirm }: UploadPreviewModalProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    if (file) {
      const objectUrl = URL.createObjectURL(file)
      setUrl(objectUrl)
      return () => URL.revokeObjectURL(objectUrl)
    }
  }, [file])

  const togglePlay = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(console.error)
    }
  }

  useEffect(() => {
    if (!url) return
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

  if (!file) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Preview "{file.name}"</DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={togglePlay}>
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </Button>
          <span className="text-sm text-slate-600">{file.name}</span>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={onConfirm} className="bg-orange-500 hover:bg-orange-600 text-white">Upload</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}