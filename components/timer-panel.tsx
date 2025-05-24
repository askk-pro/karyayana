"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Pause, Play, Plus, RotateCcw, Square } from "lucide-react"
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

  useEffect(() => {
    const stored = localStorage.getItem("karyayana-sounds")
    if (stored) {
      const parsed: CustomSound[] = JSON.parse(stored)
      setSounds(parsed)
      setSelectedSound(parsed[0] || null)
    }
  }, [])

  useEffect(() => {
    if (timers.some((t) => t.isActive && !t.isPaused)) {
      intervalRef.current = setInterval(() => {
        setTimers((prev) =>
          prev.map((timer) => {
            if (timer.isActive && !timer.isPaused && timer.remaining > 0) {
              const remaining = timer.remaining - 1
              if (remaining === 0) {
                const audio = new Audio(timer.soundUrl)
                audio.play()
                return { ...timer, remaining: 0, isActive: false }
              }
              return { ...timer, remaining }
            }
            return timer
          }),
        )
      }, 1000)
    } else {
      clearInterval(intervalRef.current!)
    }

    return () => clearInterval(intervalRef.current!)
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
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Focus Timers</h2>
        <Button onClick={() => setShowCreateForm(!showCreateForm)} size="sm" className="bg-orange-500 text-white">
          <Plus className="h-4 w-4 mr-1" /> New Timer
        </Button>
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-serif">Create New Timer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sounds.length === 0 ? (
              <p className="text-red-500 text-sm">⚠️ Please upload at least one sound to create a timer.</p>
            ) : (
              <>
                <Input
                  placeholder="Timer name..."
                  value={newTimer.taskName}
                  onChange={(e) => setNewTimer((prev) => ({ ...prev, taskName: e.target.value }))}
                  className="h-8 text-sm"
                />
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    type="number"
                    placeholder="Hours"
                    value={newTimer.hours}
                    min={0}
                    onChange={(e) => setNewTimer((prev) => ({ ...prev, hours: +e.target.value || 0 }))}
                  />
                  <Input
                    type="number"
                    placeholder="Minutes"
                    value={newTimer.minutes}
                    min={0}
                    onChange={(e) => setNewTimer((prev) => ({ ...prev, minutes: +e.target.value || 0 }))}
                  />
                  <Input
                    type="number"
                    placeholder="Seconds"
                    value={newTimer.seconds}
                    min={0}
                    onChange={(e) => setNewTimer((prev) => ({ ...prev, seconds: +e.target.value || 0 }))}
                  />
                </div>
                <select
                  className="w-full border px-3 py-2 rounded text-sm"
                  value={selectedSound?.id}
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
                <div className="flex gap-2">
                  <Button onClick={createTimer} size="sm" className="bg-orange-500 text-white">
                    Create
                  </Button>
                  <Button onClick={() => setShowCreateForm(false)} variant="outline" size="sm">
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
          <Card key={timer.id}>
            <CardHeader>
              <CardTitle className="text-sm">{timer.taskName}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-xl text-center font-mono">{formatTime(timer.remaining)}</div>
              <Progress value={getProgress(timer)} className="h-1" />
              <div className="flex justify-center gap-1">
                {!timer.isActive ? (
                  <Button size="sm" onClick={() => startTimer(timer.id)} className="bg-green-500 text-white text-xs">
                    <Play className="h-3 w-3 mr-1" />
                    Start
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => pauseTimer(timer.id)} variant="outline" className="text-xs">
                    <Pause className="h-3 w-3 mr-1" />
                    {timer.isPaused ? "Resume" : "Pause"}
                  </Button>
                )}
                <Button size="sm" onClick={() => stopTimer(timer.id)} variant="outline" className="text-xs">
                  <Square className="h-3 w-3" />
                </Button>
                <Button size="sm" onClick={() => resetTimer(timer.id)} variant="outline" className="text-xs">
                  <RotateCcw className="h-3 w-3" />
                </Button>
              </div>
              <p className="text-xs text-center text-slate-500">{timer.soundName}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
