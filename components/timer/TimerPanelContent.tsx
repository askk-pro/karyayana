"use client"

import { CompactTimerView } from "./CompactTimerView"
import { DraggableTimerGrid } from "./DraggableTimerGrid"
import { EmptyTimerState } from "./EmptyTimerState"

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

interface TimerPanelContentProps {
  timers: Timer[]
  viewMode: "detailed" | "compact"
  sounds: CustomSound[]
  globalMuted: boolean
  onStart: (id: string) => void
  onPause: (id: string) => void
  onStop: (id: string) => void
  onReset: (id: string) => void
  onDelete: (id: string) => void
  onToggleMute: (id: string) => void
  onFullScreen: (timer: Timer) => void
  onEdit: (timer: Timer) => void
  onReorder: (newTimers: Timer[]) => void
  onCreateTimer: () => void
}

export function TimerPanelContent({
  timers,
  viewMode,
  sounds,
  globalMuted,
  onStart,
  onPause,
  onStop,
  onReset,
  onDelete,
  onToggleMute,
  onFullScreen,
  onEdit,
  onReorder,
  onCreateTimer,
}: TimerPanelContentProps) {
  return (
    <>
      {/* Timers Grid */}
      {timers.length > 0 ? (
        viewMode === "detailed" ? (
          <DraggableTimerGrid
            timers={timers}
            onStart={onStart}
            onPause={onPause}
            onStop={onStop}
            onReset={onReset}
            onDelete={onDelete}
            onToggleMute={onToggleMute}
            onFullScreen={onFullScreen}
            onEdit={onEdit}
            onReorder={onReorder}
            globalMuted={globalMuted}
          />
        ) : (
          <CompactTimerView
            timers={timers}
            onStart={onStart}
            onPause={onPause}
            onDelete={onDelete}
            onUpdateTimer={onEdit}
            onReorder={onReorder}
            globalMuted={globalMuted}
            sounds={sounds}
          />
        )
      ) : (
        <EmptyTimerState onCreateTimer={onCreateTimer} />
      )}
    </>
  )
}
