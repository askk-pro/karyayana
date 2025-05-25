"use client"

import type React from "react"

import { useRef, useState } from "react"
import { TimerCard } from "./TimerCard"

interface Timer {
  id: string
  taskName: string
  hours: number
  minutes: number
  seconds: number
  totalSeconds: number
  remaining: number
  isActive: boolean
  isPaused: boolean
  soundUrl: string
  soundName: string
  soundId: string
  isRepeating?: boolean
  repeatInterval?: number
  isNegative?: boolean
  isMuted?: boolean
  primaryColor?: string
  secondaryColor?: string
  fontFamily?: string
  fontSize?: string
  lastStartedAt?: string
  lastPausedAt?: string
}

interface DraggableTimerGridProps {
  timers: Timer[]
  onStart: (id: string) => void
  onPause: (id: string) => void
  onStop: (id: string) => void
  onReset: (id: string) => void
  onDelete: (id: string) => void
  onToggleMute: (id: string) => void
  onFullScreen: (timer: Timer) => void
  onEdit: (timer: Timer) => void
  onReorder: (newTimers: Timer[]) => void
  globalMuted: boolean
}

export function DraggableTimerGrid({
  timers,
  onStart,
  onPause,
  onStop,
  onReset,
  onDelete,
  onToggleMute,
  onFullScreen,
  onEdit,
  onReorder,
  globalMuted,
}: DraggableTimerGridProps) {
  const [draggedTimer, setDraggedTimer] = useState<Timer | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const dragCounter = useRef(0)

  const handleDragStart = (e: React.DragEvent, timer: Timer) => {
    setDraggedTimer(timer)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/html", timer.id)

    // Add visual feedback
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "0.5"
    }
  }

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedTimer(null)
    setDragOverIndex(null)
    dragCounter.current = 0

    // Reset visual feedback
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "1"
    }
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

  const handleDragLeave = (e: React.DragEvent) => {
    dragCounter.current--
    if (dragCounter.current === 0) {
      setDragOverIndex(null)
    }
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    setDragOverIndex(null)
    dragCounter.current = 0

    if (!draggedTimer) return

    const dragIndex = timers.findIndex((t) => t.id === draggedTimer.id)
    if (dragIndex === dropIndex) return

    const newTimers = [...timers]
    const [removed] = newTimers.splice(dragIndex, 1)
    newTimers.splice(dropIndex, 0, removed)

    onReorder(newTimers)
    setDraggedTimer(null)
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {timers.map((timer, index) => (
        <div
          key={timer.id}
          draggable
          onDragStart={(e) => handleDragStart(e, timer)}
          onDragEnd={handleDragEnd}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragEnter={(e) => handleDragEnter(e, index)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, index)}
          className={`transition-all duration-200 ${dragOverIndex === index ? "transform scale-105 shadow-lg" : ""} ${
            draggedTimer?.id === timer.id ? "opacity-50" : ""
          }`}
          style={{
            cursor: "grab",
          }}
          onMouseDown={(e) => {
            if (e.currentTarget instanceof HTMLElement) {
              e.currentTarget.style.cursor = "grabbing"
            }
          }}
          onMouseUp={(e) => {
            if (e.currentTarget instanceof HTMLElement) {
              e.currentTarget.style.cursor = "grab"
            }
          }}
        >
          <TimerCard
            timer={timer}
            onStart={onStart}
            onPause={onPause}
            onStop={onStop}
            onReset={onReset}
            onDelete={onDelete}
            onToggleMute={onToggleMute}
            onFullScreen={() => onFullScreen(timer)}
            onEdit={onEdit}
            globalMuted={globalMuted}
          />
        </div>
      ))}
    </div>
  )
}
