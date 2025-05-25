"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Maximize2, Settings, Trash2, Volume2, VolumeX } from "lucide-react"
import { useState } from "react"
import { TimerControls } from "./TimerControls"
import { TimerDisplay } from "./TimerDisplay"
import { TimerStatus } from "./TimerStatus"

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

interface TimerCardProps {
  timer: Timer
  onStart: (id: string) => void
  onPause: (id: string) => void
  onStop: (id: string) => void
  onReset: (id: string) => void
  onDelete: (id: string) => void
  onToggleMute: (id: string) => void
  onFullScreen: () => void
  onEdit?: (timer: Timer) => void
  globalMuted: boolean
}

export function TimerCard({
  timer,
  onStart,
  onPause,
  onStop,
  onReset,
  onDelete,
  onToggleMute,
  onFullScreen,
  onEdit,
  globalMuted,
}: TimerCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const isEffectivelyMuted = globalMuted || timer.isMuted

  const handleReset = () => {
    // Reset to original duration
    onReset(timer.id)
  }

  const getCardStyle = () => {
    if (timer.isActive) {
      return {
        borderColor: timer.primaryColor || "#f59e0b",
        boxShadow: `0 0 0 1px ${timer.primaryColor || "#f59e0b"}`,
      }
    }
    return {}
  }

  const getTimerBadges = () => {
    const badges = []

    if (timer.isRepeating) {
      badges.push(
        <span
          key="repeat"
          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
        >
          🔄 Repeats every {timer.repeatInterval}s
        </span>,
      )
    }

    if (timer.isNegative) {
      badges.push(
        <span
          key="negative"
          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
        >
          ⏰ Overtime
        </span>,
      )
    }

    if (isEffectivelyMuted) {
      badges.push(
        <span
          key="muted"
          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
        >
          🔇 Muted
        </span>,
      )
    }

    return badges
  }

  return (
    <Card className={`transition-all duration-200 hover:shadow-md animate-fade-in`} style={getCardStyle()}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-sm truncate flex-1 mr-2">{timer.taskName}</CardTitle>
          <div className="flex gap-1">
            {/* Full Screen Button - Show for active timers */}
            {timer.isActive && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onFullScreen}
                className="h-6 w-6 p-0 hover:bg-slate-100 dark:hover:bg-slate-700"
                title="Open timer in full screen mode"
              >
                <Maximize2 className="h-3 w-3" />
              </Button>
            )}

            {/* Mute Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleMute(timer.id)}
              className="h-6 w-6 p-0 hover:bg-slate-100 dark:hover:bg-slate-700"
              title={timer.isMuted ? "Unmute this timer" : "Mute this timer"}
            >
              {timer.isMuted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
            </Button>

            {/* Edit Button */}
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(timer)}
                className="h-6 w-6 p-0 hover:bg-slate-100 dark:hover:bg-slate-700"
                title="Edit timer settings"
              >
                <Settings className="h-3 w-3" />
              </Button>
            )}

            {/* Delete Button */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-red-100 dark:hover:bg-red-900 text-red-500"
                  title="Delete this timer permanently"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Timer</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete &quot;{timer.taskName}&quot;? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      onDelete(timer.id)
                      setShowDeleteDialog(false)
                    }}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Timer Badges */}
        {getTimerBadges().length > 0 && <div className="flex flex-wrap gap-1 mt-2">{getTimerBadges()}</div>}
      </CardHeader>

      <CardContent className="space-y-3">
        <TimerDisplay
          remaining={timer.remaining}
          totalSeconds={timer.totalSeconds}
          soundName={timer.soundName}
          isNegative={timer.isNegative}
          primaryColor={timer.primaryColor}
          fontFamily={timer.fontFamily}
          fontSize={timer.fontSize}
        />

        <TimerControls
          isActive={timer.isActive}
          isPaused={timer.isPaused}
          onStart={() => onStart(timer.id)}
          onPause={() => onPause(timer.id)}
          onStop={() => onStop(timer.id)}
          onReset={() => handleReset()}
        />

        <div className="text-center text-xs">
          <TimerStatus
            remaining={timer.remaining}
            isActive={timer.isActive}
            isPaused={timer.isPaused}
            isRepeating={timer.isRepeating}
            isNegative={timer.isNegative}
          />
        </div>
      </CardContent>
    </Card>
  )
}
