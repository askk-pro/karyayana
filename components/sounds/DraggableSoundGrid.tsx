"use client"

import type React from "react"

import { useRef, useState } from "react"
import { SoundCard } from "./SoundCard"

interface Sound {
  id: string
  name: string
  filename: string
  filepath: string
  url: string
  duration?: number
  volume?: number
  start_time?: number
  end_time?: number
  primary_color?: string
  secondary_color?: string
  created_at: string
  display_order?: number
}

interface DraggableSoundGridProps {
  sounds: Sound[]
  onEdit: (sound: Sound) => void
  onDelete: (id: string) => void
  onRename: (id: string, newName: string) => void
  onReorder: (newSounds: Sound[]) => void
}

export function DraggableSoundGrid({ sounds, onEdit, onDelete, onRename, onReorder }: DraggableSoundGridProps) {
  const [draggedSound, setDraggedSound] = useState<Sound | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const dragCounter = useRef(0)

  const handleDragStart = (e: React.DragEvent, sound: Sound) => {
    setDraggedSound(sound)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/html", sound.id)
  }

  const handleDragEnd = () => {
    setDraggedSound(null)
    setDragOverIndex(null)
    dragCounter.current = 0
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDragOverIndex(index)
  }

  const handleDragEnter = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    dragCounter.current++
    setDragOverIndex(index)
  }

  const handleDragLeave = () => {
    dragCounter.current--
    if (dragCounter.current === 0) {
      setDragOverIndex(null)
    }
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    setDragOverIndex(null)
    dragCounter.current = 0

    if (!draggedSound) return

    const dragIndex = sounds.findIndex((s) => s.id === draggedSound.id)
    if (dragIndex === dropIndex) return

    const newSounds = [...sounds]
    const [removed] = newSounds.splice(dragIndex, 1)
    newSounds.splice(dropIndex, 0, removed)

    onReorder(newSounds)
    setDraggedSound(null)
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
      {sounds.map((sound, index) => (
        <div
          key={sound.id}
          draggable
          onDragStart={(e) => handleDragStart(e, sound)}
          onDragEnd={handleDragEnd}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragEnter={(e) => handleDragEnter(e, index)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, index)}
          className={`transition-all duration-200 ${dragOverIndex === index ? "transform scale-105 shadow-lg" : ""}`}
        >
          <SoundCard
            sound={sound}
            onEdit={onEdit}
            onDelete={onDelete}
            onRename={onRename}
            isDragging={draggedSound?.id === sound.id}
          />
        </div>
      ))}
    </div>
  )
}
