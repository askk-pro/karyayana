"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Minimize2, X } from "lucide-react"
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

interface FullScreenTimerProps {
  timer: Timer
  onStart: (id: string) => void
  onPause: (id: string) => void
  onStop: (id: string) => void
  onReset: (id: string) => void
  onClose: () => void
  globalMuted: boolean
}

export function FullScreenTimer({
  timer,
  onStart,
  onPause,
  onStop,
  onReset,
  onClose,
  globalMuted,
}: FullScreenTimerProps) {
  const [isMinimized, setIsMinimized] = useState(false)

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Card className="w-64 shadow-lg border-2" style={{ borderColor: timer.primaryColor }}>
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium truncate">{timer.taskName}</h3>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(false)}
                  className="h-6 w-6 p-0"
                  title="Expand to full screen"
                >
                  <Minimize2 className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-6 w-6 p-0"
                  title="Close full screen mode"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <TimerDisplay
              remaining={timer.remaining}
              totalSeconds={timer.totalSeconds}
              soundName={timer.soundName}
              isNegative={timer.isNegative}
              primaryColor={timer.primaryColor}
              fontFamily={timer.fontFamily}
              fontSize="text-lg"
            />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black z-[9999] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <Card
          className="border shadow-2xl bg-white dark:bg-slate-900"
          style={{ borderColor: timer.primaryColor, borderWidth: "1px" }}
        >
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{timer.taskName}</h1>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setIsMinimized(true)}
                  title="Minimize to corner widget"
                  className="text-base px-4 py-2"
                >
                  <Minimize2 className="h-4 w-4 mr-2" />
                  Minimize
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={onClose}
                  title="Close full screen mode"
                  className="text-base px-4 py-2"
                >
                  <X className="h-4 w-4 mr-2" />
                  Close
                </Button>
              </div>
            </div>

            <div className="text-center space-y-8">
              <TimerDisplay
                remaining={timer.remaining}
                totalSeconds={timer.totalSeconds}
                soundName={timer.soundName}
                isNegative={timer.isNegative}
                primaryColor={timer.primaryColor}
                fontFamily={timer.fontFamily}
                fontSize="text-6xl"
                size={250}
              />

              <div className="space-y-4">
                <TimerControls
                  isActive={timer.isActive}
                  isPaused={timer.isPaused}
                  onStart={() => onStart(timer.id)}
                  onPause={() => onPause(timer.id)}
                  onStop={() => onStop(timer.id)}
                  onReset={() => onReset(timer.id)}
                  size="lg"
                />

                <div className="text-lg">
                  <TimerStatus
                    remaining={timer.remaining}
                    isActive={timer.isActive}
                    isPaused={timer.isPaused}
                    isRepeating={timer.isRepeating}
                    isNegative={timer.isNegative}
                  />
                </div>
              </div>

              {(timer.isRepeating || timer.isNegative) && (
                <div className="flex justify-center gap-3">
                  {timer.isRepeating && (
                    <span className="inline-flex items-center px-3 py-2 rounded-full text-base bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      🔄 Repeats every {timer.repeatInterval}s
                    </span>
                  )}
                  {timer.isNegative && (
                    <span className="inline-flex items-center px-3 py-2 rounded-full text-base bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                      ⏰ Overtime Mode
                    </span>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
