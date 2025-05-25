"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { useEffect, useState } from "react"
import { ColorPicker } from "../timer/ColorPicker"
import { SoundPreview } from "./SoundPreview"

interface SoundUploadModalProps {
  file: File | null
  open: boolean
  onClose: () => void
  onConfirm: (data: {
    name: string
    startTime: number
    endTime: number
    volume: number
    primaryColor: string
    secondaryColor: string
  }) => void
}

export function SoundUploadModal({ file, open, onClose, onConfirm }: SoundUploadModalProps) {
  const [name, setName] = useState("")
  const [duration, setDuration] = useState(0)
  const [startTime, setStartTime] = useState(0)
  const [endTime, setEndTime] = useState(0)
  const [volume, setVolume] = useState(1)
  const [primaryColor, setPrimaryColor] = useState("#3b82f6")
  const [secondaryColor, setSecondaryColor] = useState("#60a5fa")
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    if (file) {
      const objectUrl = URL.createObjectURL(file)
      setUrl(objectUrl)
      setName(file.name.replace(/\.[^/.]+$/, ""))

      // Get audio duration
      const audio = new Audio(objectUrl)
      audio.addEventListener("loadedmetadata", () => {
        setDuration(audio.duration)
        setEndTime(audio.duration)
      })

      return () => URL.revokeObjectURL(objectUrl)
    }
  }, [file])

  const handleConfirm = () => {
    onConfirm({
      name,
      startTime,
      endTime,
      volume,
      primaryColor,
      secondaryColor,
    })
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (!file || !url) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Sound: {file.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Sound Name */}
          <div>
            <Label htmlFor="name">Sound Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter sound name..."
              className="mt-1"
            />
          </div>

          {/* Preview */}
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <SoundPreview url={url} volume={volume} startTime={startTime} endTime={endTime} />
            <div>
              <p className="text-sm font-medium">{name}</p>
              <p className="text-xs text-slate-500">
                {formatTime(endTime - startTime)} / {formatTime(duration)}
              </p>
            </div>
          </div>

          {/* Trim Controls */}
          <div className="space-y-4">
            <Label>Trim Audio</Label>

            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Start: {formatTime(startTime)}</span>
                <span>End: {formatTime(endTime)}</span>
              </div>

              {/* Start Time Slider */}
              <div>
                <Label className="text-xs">Start Time</Label>
                <Slider
                  value={[startTime]}
                  onValueChange={(value: number[]) => setStartTime(Math.min(value[0], endTime - 1))}
                  max={duration}
                  step={0.1}
                  className="mt-1"
                />
              </div>

              {/* End Time Slider */}
              <div>
                <Label className="text-xs">End Time</Label>
                <Slider
                  value={[endTime]}
                  onValueChange={(value: number[]) => setEndTime(Math.max(value[0], startTime + 1))}
                  max={duration}
                  step={0.1}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Volume Control */}
          <div>
            <Label>Volume: {Math.round(volume * 100)}%</Label>
            <Slider
              value={[volume]}
              onValueChange={(value: number[]) => setVolume(value[0])}
              max={1}
              step={0.01}
              className="mt-2"
            />
          </div>

          {/* Color Selection */}
          <ColorPicker
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            onColorChange={(primary, secondary) => {
              setPrimaryColor(primary)
              setSecondaryColor(secondary)
            }}
          />

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              className="bg-orange-500 hover:bg-orange-600 text-white"
              disabled={!name.trim()}
            >
              Upload Sound
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
