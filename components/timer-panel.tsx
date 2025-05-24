"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Pause, Play, Plus, RotateCcw, Square, Volume2 } from "lucide-react"
import { useEffect, useRef, useState } from "react"

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
}

interface CustomSound {
  id: string
  name: string
  url: string
}

export function TimerPanel() {
  const [timers, setTimers] = useState<Timer[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newTimer, setNewTimer] = useState({ taskName: "", hours: 0, minutes: 25, seconds: 0 })
  const [sounds, setSounds] = useState<CustomSound[]>([])
  const [selectedSound, setSelectedSound] = useState<CustomSound | null>(null)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Load sounds from localStorage (updated by sounds manager)
  useEffect(() => {
    const loadSounds = () => {
      const stored = localStorage.getItem("karyayana-sounds")
      if (stored) {
        const parsed: CustomSound[] = JSON.parse(stored)
        setSounds(parsed)
        if (parsed.length > 0 && !selectedSound) {
          setSelectedSound(parsed[0])
        }
      }
    }

    loadSounds()

    // Listen for storage changes (when sounds are added/removed)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "karyayana-sounds") {
        loadSounds()
      }
    }

    window.addEventListener("storage", handleStorageChange)

    // Also check periodically for updates
    const interval = setInterval(loadSounds, 1000)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      clearInterval(interval)
    }
  }, [selectedSound])

  // Listen for keyboard shortcuts
  useEffect(() => {
    const handleCreateTimer = () => {
      setShowCreateForm(true)
    }

    const handleToggleTimer = () => {
      const activeTimer = timers.find((t) => t.isActive && !t.isPaused)
      if (activeTimer) {
        pauseTimer(activeTimer.id)
      } else {
        const pausedTimer = timers.find((t) => t.isActive && t.isPaused)
        if (pausedTimer) {
          pauseTimer(pausedTimer.id)
        }
      }
    }

    window.addEventListener("create-new-timer", handleCreateTimer)
    window.addEventListener("toggle-active-timer", handleToggleTimer)

    return () => {
      window.removeEventListener("create-new-timer", handleCreateTimer)
      window.removeEventListener("toggle-active-timer", handleToggleTimer)
    }
  }, [timers])

  // Timer countdown logic
  useEffect(() => {
    if (timers.some((t) => t.isActive && !t.isPaused)) {
      intervalRef.current = setInterval(() => {
        setTimers((prev) =>
          prev.map((timer) => {
            if (timer.isActive && !timer.isPaused && timer.remaining > 0) {
              const remaining = timer.remaining - 1
              if (remaining === 0) {
                // Play completion sound
                const audio = new Audio(timer.soundUrl)
                audio.play().catch(console.error)
                return { ...timer, remaining: 0, isActive: false }
              }
              return { ...timer, remaining }
            }
            return timer
          }),
        )
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [timers])

  const createTimer = () => {
    if (!newTimer.taskName.trim() || !selectedSound) return
    const totalSeconds = newTimer.hours * 3600 + newTimer.minutes * 60 + newTimer.seconds
    if (totalSeconds === 0) return

    const timer: Timer = {
      id: Date.now().toString(),
      taskName: newTimer.taskName,
      hours: newTimer.hours,
      minutes: newTimer.minutes,
      seconds: newTimer.seconds,
      totalSeconds,
      remaining: totalSeconds,
      isActive: false,
      isPaused: false,
      soundUrl: selectedSound.url,
      soundName: selectedSound.name,
    }

    setTimers((prev) => [...prev, timer])
    setNewTimer({ taskName: "", hours: 0, minutes: 25, seconds: 0 })
    setShowCreateForm(false)
  }

  const formatTime = (s: number) => {
    const hrs = Math.floor(s / 3600)
    const mins = Math.floor((s % 3600) / 60)
    const secs = s % 60

    if (hrs > 0) {
      return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const startTimer = (id: string) =>
    setTimers((prev) => prev.map((t) => (t.id === id ? { ...t, isActive: true, isPaused: false } : t)))

  const pauseTimer = (id: string) =>
    setTimers((prev) => prev.map((t) => (t.id === id ? { ...t, isPaused: !t.isPaused } : t)))

  const stopTimer = (id: string) =>
    setTimers((prev) => prev.map((t) => (t.id === id ? { ...t, isActive: false, isPaused: false } : t)))

  const resetTimer = (id: string) =>
    setTimers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, remaining: t.totalSeconds, isActive: false, isPaused: false } : t)),
    )

  const deleteTimer = (id: string) => setTimers((prev) => prev.filter((t) => t.id !== id))

  const getProgress = (t: Timer) => ((t.totalSeconds - t.remaining) / t.totalSeconds) * 100

  const previewSound = (sound: CustomSound) => {
    const audio = new Audio(sound.url)
    audio.play().catch(console.error)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Focus Timers</h2>
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-orange-500 hover:bg-orange-600 text-white h-8 px-3 text-sm"
        >
          <Plus className="h-4 w-4 mr-1" /> New Timer
        </Button>
      </div>

      {showCreateForm && (
        <Card className="animate-slide-down">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-serif">Create New Timer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sounds.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-red-500 text-sm mb-2">⚠️ No sounds available</p>
                <p className="text-xs text-slate-500">
                  Please upload at least one sound in the Sounds section to create a timer.
                </p>
              </div>
            ) : (
              <>
                <Input
                  placeholder="Timer name..."
                  value={newTimer.taskName}
                  onChange={(e) => setNewTimer((prev) => ({ ...prev, taskName: e.target.value }))}
                  className="h-8 text-sm"
                />
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-xs text-slate-600 dark:text-slate-400">Hours</label>
                    <Input
                      type="number"
                      min={0}
                      max={23}
                      value={newTimer.hours}
                      onChange={(e) => setNewTimer((prev) => ({ ...prev, hours: +e.target.value || 0 }))}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-600 dark:text-slate-400">Minutes</label>
                    <Input
                      type="number"
                      min={0}
                      max={59}
                      value={newTimer.minutes}
                      onChange={(e) => setNewTimer((prev) => ({ ...prev, minutes: +e.target.value || 0 }))}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-600 dark:text-slate-400">Seconds</label>
                    <Input
                      type="number"
                      min={0}
                      max={59}
                      value={newTimer.seconds}
                      onChange={(e) => setNewTimer((prev) => ({ ...prev, seconds: +e.target.value || 0 }))}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block">Completion Sound</label>
                  <div className="flex gap-2">
                    <select
                      className="flex-1 h-8 px-3 py-1 text-sm border border-input bg-background rounded-md"
                      value={selectedSound?.id || ""}
                      onChange={(e) => {
                        const selected = sounds.find((s) => s.id === e.target.value)
                        if (selected) setSelectedSound(selected)
                      }}
                    >
                      {sounds.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                    {selectedSound && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => previewSound(selectedSound)}
                        className="h-8 px-2"
                      >
                        <Volume2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={createTimer}
                    className="bg-orange-500 hover:bg-orange-600 text-white h-8 px-3 text-sm"
                  >
                    Create
                  </Button>
                  <Button
                    onClick={() => setShowCreateForm(false)}
                    variant="outline"
                    size="sm"
                    className="h-8 px-3 text-sm"
                  >
                    Cancel
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Timers List */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {timers.map((timer) => (
          <Card
            key={timer.id}
            className={`transition-all duration-200 hover:shadow-md ${
              timer.isActive ? "ring-1 ring-orange-500" : ""
            } animate-fade-in`}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm truncate">{timer.taskName}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-center">
                <div className="text-2xl font-mono font-bold text-slate-800 dark:text-slate-100">
                  {formatTime(timer.remaining)}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{timer.soundName}</div>
              </div>

              <Progress value={getProgress(timer)} className="h-1" />

              <div className="flex justify-center gap-1">
                {!timer.isActive ? (
                  <Button
                    onClick={() => startTimer(timer.id)}
                    className="bg-green-500 hover:bg-green-600 text-white h-7 px-2 text-xs"
                  >
                    <Play className="h-3 w-3 mr-1" />
                    Start
                  </Button>
                ) : (
                  <Button onClick={() => pauseTimer(timer.id)} variant="outline" size="sm" className="h-7 px-2 text-xs">
                    <Pause className="h-3 w-3 mr-1" />
                    {timer.isPaused ? "Resume" : "Pause"}
                  </Button>
                )}
                <Button onClick={() => stopTimer(timer.id)} variant="outline" size="sm" className="h-7 px-2 text-xs">
                  <Square className="h-3 w-3" />
                </Button>
                <Button onClick={() => resetTimer(timer.id)} variant="outline" size="sm" className="h-7 px-2 text-xs">
                  <RotateCcw className="h-3 w-3" />
                </Button>
              </div>

              <div className="text-center text-xs">
                {timer.remaining === 0 && <span className="text-green-600 font-medium">✨ Completed!</span>}
                {timer.isActive && timer.remaining > 0 && (
                  <span className="text-orange-600 font-medium">{timer.isPaused ? "⏸️ Paused" : "⏱️ Active"}</span>
                )}
                {!timer.isActive && timer.remaining > 0 && <span className="text-slate-500">Ready</span>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {timers.length === 0 && (
        <div className="text-center py-12 animate-fade-in">
          <div className="text-4xl mb-3">⏰</div>
          <h3 className="text-lg font-serif font-medium text-slate-700 dark:text-slate-300 mb-2">
            Create Your First Timer
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Start a focused session with your custom sounds.
          </p>
          {sounds.length > 0 ? (
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white h-8 px-3 text-sm"
            >
              Create Timer
            </Button>
          ) : (
            <p className="text-xs text-slate-400">Upload sounds first to create timers</p>
          )}
        </div>
      )}
    </div>
  )
}
