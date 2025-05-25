"use client"

import type React from "react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Pause, Play, Trash2 } from "lucide-react"
import { useState } from "react"

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

interface CustomSound {
  id: string
  name: string
  url: string
}

interface CompactTimerViewProps {
  timers: Timer[]
  onStart: (id: string) => void
  onPause: (id: string) => void
  onDelete: (id: string) => void
  onUpdateTimer: (timer: Timer) => void
  globalMuted: boolean
  sounds: CustomSound[]
}

export function CompactTimerView({
  timers,
  onStart,
  onPause,
  onDelete,
  onUpdateTimer,
  globalMuted,
  sounds,
}: CompactTimerViewProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState<string | null>(null)
  const [editingDuration, setEditingDuration] = useState<string | null>(null)
  const [hoveredTimer, setHoveredTimer] = useState<string | null>(null)

  const formatTime = (seconds: number) => {
    const isNeg = seconds < 0
    const absSeconds = Math.abs(seconds)
    const hrs = Math.floor(absSeconds / 3600)
    const mins = Math.floor((absSeconds % 3600) / 60)
    const secs = absSeconds % 60

    const timeStr =
      hrs > 0
        ? `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
        : `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`

    return isNeg ? `-${timeStr}` : timeStr
  }

  const getStatusColor = (timer: Timer) => {
    if (timer.remaining <= 0 && !timer.isNegative) return "text-green-600"
    if (timer.remaining < 0 && timer.isNegative) return "text-red-600"
    if (timer.isActive && !timer.isPaused) return timer.primaryColor || "#f59e0b"
    if (timer.isPaused) return "text-amber-600"
    return "text-slate-600"
  }

  const updateTimerTitle = (timer: Timer, newTitle: string) => {
    if (newTitle.trim() && newTitle !== timer.taskName) {
      const updatedTimer = { ...timer, taskName: newTitle.trim() }
      onUpdateTimer(updatedTimer)
    }
    setEditingTitle(null)
  }

  const updateTimerDuration = (timer: Timer, minutes: number, seconds = 0) => {
    const totalSeconds = minutes * 60 + seconds
    const updatedTimer = {
      ...timer,
      minutes,
      seconds,
      hours: 0,
      totalSeconds,
      remaining: timer.isActive ? timer.remaining : totalSeconds,
    }
    onUpdateTimer(updatedTimer)
    setEditingDuration(null)
  }

  const handleTitleKeyPress = (e: React.KeyboardEvent, timer: Timer, newTitle: string) => {
    if (e.key === "Enter") {
      updateTimerTitle(timer, newTitle)
    } else if (e.key === "Escape") {
      setEditingTitle(null)
    }
  }

  const handleDurationKeyPress = (e: React.KeyboardEvent, timer: Timer, minutes: string, seconds: string) => {
    if (e.key === "Enter") {
      updateTimerDuration(timer, Number.parseInt(minutes) || 0, Number.parseInt(seconds) || 0)
    } else if (e.key === "Escape") {
      setEditingDuration(null)
    }
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {timers.map((timer) => (
            <div
              key={timer.id}
              className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              style={{
                borderLeftColor: timer.isActive ? timer.primaryColor : undefined,
                borderLeftWidth: timer.isActive ? "3px" : "1px",
              }}
              onMouseEnter={() => setHoveredTimer(timer.id)}
              onMouseLeave={() => setHoveredTimer(null)}
            >
              {/* Timer Name & Time */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {editingTitle === timer.id ? (
                    <Input
                      defaultValue={timer.taskName}
                      className="h-6 text-sm font-medium"
                      autoFocus
                      onBlur={(e) => updateTimerTitle(timer, e.target.value)}
                      onKeyDown={(e) => handleTitleKeyPress(e, timer, e.currentTarget.value)}
                    />
                  ) : (
                    <h3
                      className="font-medium text-sm truncate cursor-pointer hover:text-orange-600"
                      onClick={() => !timer.isActive && setEditingTitle(timer.id)}
                      title={timer.isActive ? "Cannot edit title while timer is active" : "Click to edit title"}
                    >
                      {timer.taskName}
                    </h3>
                  )}
                  {(timer.isRepeating || timer.isNegative || globalMuted || timer.isMuted) && (
                    <div className="flex gap-1">
                      {timer.isRepeating && <span className="text-xs">🔄</span>}
                      {timer.isNegative && <span className="text-xs">⏰</span>}
                      {(globalMuted || timer.isMuted) && <span className="text-xs">🔇</span>}
                    </div>
                  )}
                </div>

                {/* Timer Display */}
                {editingDuration === timer.id && !timer.isActive ? (
                  <div className="flex gap-1">
                    <Input
                      type="number"
                      min={0}
                      max={59}
                      defaultValue={timer.minutes}
                      className="h-6 w-12 text-xs"
                      placeholder="M"
                      autoFocus
                      onBlur={(e) => {
                        const minutes = Number.parseInt(e.target.value) || 0
                        const secondsInput = e.target.nextElementSibling as HTMLInputElement
                        const seconds = Number.parseInt(secondsInput?.value) || 0
                        updateTimerDuration(timer, minutes, seconds)
                      }}
                      onKeyDown={(e) => {
                        const minutes = e.currentTarget.value
                        const secondsInput = e.currentTarget.nextElementSibling as HTMLInputElement
                        const seconds = secondsInput?.value || "0"
                        handleDurationKeyPress(e, timer, minutes, seconds)
                      }}
                    />
                    <span className="text-xs self-center">:</span>
                    <Input
                      type="number"
                      min={0}
                      max={59}
                      defaultValue={timer.seconds}
                      className="h-6 w-12 text-xs"
                      placeholder="S"
                      onBlur={(e) => {
                        const seconds = Number.parseInt(e.target.value) || 0
                        const minutesInput = e.target.previousElementSibling?.previousElementSibling as HTMLInputElement
                        const minutes = Number.parseInt(minutesInput?.value) || 0
                        updateTimerDuration(timer, minutes, seconds)
                      }}
                      onKeyDown={(e) => {
                        const seconds = e.currentTarget.value
                        const minutesInput = e.currentTarget.previousElementSibling
                          ?.previousElementSibling as HTMLInputElement
                        const minutes = minutesInput?.value || "0"
                        handleDurationKeyPress(e, timer, minutes, seconds)
                      }}
                    />
                  </div>
                ) : (
                  <div
                    className={`text-lg font-mono font-bold cursor-pointer hover:text-orange-600 ${
                      timer.fontFamily === "serif"
                        ? "font-serif"
                        : timer.fontFamily === "sans"
                        ? "font-sans"
                        : "font-mono"
                    }`}
                    style={{ color: getStatusColor(timer) }}
                    onClick={() => !timer.isActive && setEditingDuration(timer.id)}
                    title={timer.isActive ? "Cannot edit duration while timer is active" : "Click to edit duration"}
                  >
                    {formatTime(timer.remaining)}
                  </div>
                )}
              </div>

              {/* Play/Pause Button */}
              <Button
                onClick={() => (timer.isActive ? onPause(timer.id) : onStart(timer.id))}
                size="sm"
                className={`h-8 w-8 p-0 ${
                  timer.isActive && !timer.isPaused
                    ? "bg-amber-500 hover:bg-amber-600"
                    : "bg-green-500 hover:bg-green-600"
                }`}
                title={timer.isActive ? (timer.isPaused ? "Resume timer" : "Pause timer") : "Start timer"}
              >
                {timer.isActive && !timer.isPaused ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
              </Button>

              {/* Delete Button - Show only on hover */}
              {hoveredTimer === timer.id && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteConfirm(timer.id)}
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900"
                  title="Delete timer"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Timer</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete &quot;
                {timers.find((t) => t.id === deleteConfirm)?.taskName}&quot;? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (deleteConfirm) {
                    onDelete(deleteConfirm)
                    setDeleteConfirm(null)
                  }
                }}
                className="bg-red-500 hover:bg-red-600"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  )
}
