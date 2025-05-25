"use client"

import { useCallback, useEffect, useState } from "react"
import { FullScreenTimer } from "./timer/FullScreenTimer"
import { TimerPanelContent } from "./timer/TimerPanelContent"
import { TimerPanelDialogs } from "./timer/TimerPanelDialogs"
import { TimerPanelHeader } from "./timer/TimerPanelHeader"
import { useTimerData } from "./timer/useTimerData"
import { useTimerLogic } from "./timer/useTimerLogic"

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
  startTimestamp?: number
  pauseTimestamp?: number
  totalPausedDuration?: number
  lastStartedAt?: string
  lastPausedAt?: string
}

interface CustomSound {
  id: string
  name: string
  url: string
}

export function TimerPanel() {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showJsonEditor, setShowJsonEditor] = useState(false)
  const [editingTimer, setEditingTimer] = useState<Timer | null>(null)
  const [fullScreenTimer, setFullScreenTimer] = useState<Timer | null>(null)
  const [viewMode, setViewMode] = useState<"detailed" | "compact">("detailed")

  // Custom hooks for data management
  const { timers, setTimers, sounds, isLoadingSounds, globalMuted, setGlobalMuted } = useTimerData()

  // Custom hook for timer logic
  const {
    saveTimerToDatabase,
    createTimer,
    createTimerFromJson,
    updateTimer,
    updateTimerOrder,
    startTimer,
    pauseTimer,
    stopTimer,
    resetTimer,
    deleteTimer,
    toggleTimerMute,
    toggleGlobalMute,
  } = useTimerLogic(timers, setTimers, globalMuted, setGlobalMuted)

  // Update fullscreen timer when timers change
  useEffect(() => {
    if (fullScreenTimer) {
      const updatedTimer = timers.find((t) => t.id === fullScreenTimer.id)
      if (updatedTimer) {
        setFullScreenTimer(updatedTimer)
      } else {
        setFullScreenTimer(null)
      }
    }
  }, [timers, fullScreenTimer])

  // Save before window close
  useEffect(() => {
    const handleBeforeUnload = async (e: BeforeUnloadEvent) => {
      for (const timer of timers) {
        await saveTimerToDatabase(timer)
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [timers, saveTimerToDatabase])

  // Listen for keyboard shortcuts
  useEffect(() => {
    const handleShortcuts = (event: any, message: string) => {
      switch (message) {
        case "shortcut-new-timer":
          setShowCreateForm(true)
          break
        case "shortcut-toggle-timer":
          const activeTimer = timers.find((t) => t.isActive && !t.isPaused)
          if (activeTimer) {
            pauseTimer(activeTimer.id)
          } else {
            const pausedTimer = timers.find((t) => t.isActive && t.isPaused)
            if (pausedTimer) {
              pauseTimer(pausedTimer.id)
            }
          }
          break
      }
    }

    if (typeof window !== "undefined" && window.electronAPI?.on) {
      window.electronAPI.on("shortcut-new-timer", handleShortcuts)
      window.electronAPI.on("shortcut-toggle-timer", handleShortcuts)
    }

    return () => {
      if (typeof window !== "undefined" && window.electronAPI?.removeAllListeners) {
        window.electronAPI.removeAllListeners("shortcut-new-timer")
        window.electronAPI.removeAllListeners("shortcut-toggle-timer")
      }
    }
  }, [timers, pauseTimer])

  const openFullScreen = useCallback((timer: Timer) => {
    setFullScreenTimer(timer)
  }, [])

  const activeTimer = timers.find((t) => t.isActive)

  return (
    <div className="space-y-4">
      <TimerPanelHeader
        timerCount={timers.length}
        activeTimer={activeTimer}
        globalMuted={globalMuted}
        viewMode={viewMode}
        onOpenFullScreen={() => activeTimer && openFullScreen(activeTimer)}
        onToggleGlobalMute={toggleGlobalMute}
        onToggleViewMode={() => setViewMode(viewMode === "detailed" ? "compact" : "detailed")}
        onOpenJsonEditor={() => setShowJsonEditor(true)}
        onOpenCreateForm={() => setShowCreateForm(true)}
      />

      <TimerPanelDialogs
        showCreateForm={showCreateForm}
        showJsonEditor={showJsonEditor}
        editingTimer={editingTimer}
        sounds={sounds}
        isLoadingSounds={isLoadingSounds}
        onCreateTimer={createTimer}
        onCreateTimerFromJson={createTimerFromJson}
        onUpdateTimer={updateTimer}
        onCloseCreateForm={() => setShowCreateForm(false)}
        onCloseJsonEditor={() => setShowJsonEditor(false)}
        onCloseEditForm={() => setEditingTimer(null)}
      />

      {/* Full Screen Timer */}
      {fullScreenTimer && (
        <FullScreenTimer
          timer={fullScreenTimer}
          onStart={startTimer}
          onPause={pauseTimer}
          onStop={stopTimer}
          onReset={resetTimer}
          onClose={() => setFullScreenTimer(null)}
          globalMuted={globalMuted}
        />
      )}

      <TimerPanelContent
        timers={timers}
        viewMode={viewMode}
        sounds={sounds}
        globalMuted={globalMuted}
        onStart={startTimer}
        onPause={pauseTimer}
        onStop={stopTimer}
        onReset={resetTimer}
        onDelete={deleteTimer}
        onToggleMute={toggleTimerMute}
        onFullScreen={openFullScreen}
        onEdit={setEditingTimer}
        onReorder={updateTimerOrder}
        onCreateTimer={() => setShowCreateForm(true)}
      />
    </div>
  )
}
