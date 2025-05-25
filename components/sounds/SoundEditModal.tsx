"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { useEffect, useState } from "react"
import { ColorPicker } from "../timer/ColorPicker"
import { SoundPreview } from "./SoundPreview"

interface Sound {
  id: string
  name: string
  url: string
  duration?: number
  volume?: number
  start_time?: number
  end_time?: number
  primary_color?: string
  secondary_color?: string
}

interface SoundEditModalProps {
  sound: Sound | null
  open: boolean
  onClose: () => void
  onSave: (data: {
    id: string
    name: string
    volume: number
    start_time: number
    end_time: number
    primary_color: string
    secondary_color: string
  }) => void
}

export function SoundEditModal({ sound, open, onClose, onSave }: SoundEditModalProps) {
  const [name, setName] = useState("")
  const [volume, setVolume] = useState(1)
  const [startTime, setStartTime] = useState(0)
  const [endTime, setEndTime] = useState(0)
  const [primaryColor, setPrimaryColor] = useState("#3b82f6")
  const [secondaryColor, setSecondaryColor] = useState("#60a5fa")

  useEffect(() => {
    if (sound) {
      setName(sound.name)
      setVolume(sound.volume || 1)
      setStartTime(sound.start_time || 0)
      setEndTime(sound.end_time || sound.duration || 0)
      setPrimaryColor(sound.primary_color || "#3b82f6")
      setSecondaryColor(sound.secondary_color || "#60a5fa")
    }
  }, [sound])

  const handleSave = () => {
    if (!sound) return

    onSave({
      id: sound.id,
      name,
      volume,
      start_time: startTime,
      end_time: endTime,
      primary_color: primaryColor,
      secondary_color: secondaryColor,
    })
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (!sound) return null

  const duration = sound.duration || 0
  const effectiveDuration = endTime - startTime

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Sound</DialogTitle>
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
          <div className="flex items-center gap-3 p-3 border rounded-lg" style={{ borderColor: primaryColor }}>
            <SoundPreview url={sound.url} volume={volume} startTime={startTime} endTime={endTime} />
            <div>
              <p className="text-sm font-medium">{name}</p>
              <p className="text-xs text-slate-500">
                {formatTime(effectiveDuration)} / {formatTime(duration)}
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
              onClick={handleSave}
              className="bg-orange-500 hover:bg-orange-600 text-white"
              disabled={!name.trim()}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
