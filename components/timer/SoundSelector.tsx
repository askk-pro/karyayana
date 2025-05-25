"use client"

import { Button } from "@/components/ui/button"
import { Volume2 } from "lucide-react"

interface CustomSound {
  id: string
  name: string
  url: string
}

interface SoundSelectorProps {
  sounds: CustomSound[]
  selectedSound: CustomSound | null
  onSoundChange: (sound: CustomSound | null) => void
  isLoading: boolean
}

export function SoundSelector({ sounds, selectedSound, onSoundChange, isLoading }: SoundSelectorProps) {
  const previewSound = (sound: CustomSound) => {
    const audio = new Audio(sound.url)
    audio.play().catch(console.error)
  }

  return (
    <div>
      <label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block">
        Completion Sound {isLoading && "(Loading...)"}
      </label>
      <div className="flex gap-2">
        <select
          className="flex-1 h-8 px-3 py-1 text-sm border border-input bg-background rounded-md"
          value={selectedSound?.id || ""}
          onChange={(e) => {
            const selected = sounds.find((s) => s.id === e.target.value) || null
            onSoundChange(selected)
          }}
        >
          <option value="">None</option>
          {sounds.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        {selectedSound && (
          <Button variant="outline" size="sm" onClick={() => previewSound(selectedSound)} className="h-8 px-2">
            <Volume2 className="h-3 w-3" />
          </Button>
        )}
      </div>
      {sounds.length === 0 && !isLoading && (
        <p className="text-xs text-slate-500 mt-1">
          No sounds available. Upload sounds in the Sounds section to add completion alerts.
        </p>
      )}
    </div>
  )
}
