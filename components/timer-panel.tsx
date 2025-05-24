"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Play, Pause, Square, RotateCcw, Volume2, Plus } from "lucide-react"

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
    chakraTone: string
}

const chakraTones = [
    { value: "root", label: "Root (256 Hz)", frequency: 256 },
    { value: "sacral", label: "Sacral (288 Hz)", frequency: 288 },
    { value: "solar", label: "Solar (320 Hz)", frequency: 320 },
    { value: "heart", label: "Heart (341.3 Hz)", frequency: 341.3 },
    { value: "throat", label: "Throat (384 Hz)", frequency: 384 },
    { value: "third-eye", label: "Third Eye (426.7 Hz)", frequency: 426.7 },
    { value: "crown", label: "Crown (480 Hz)", frequency: 480 },
]

export function TimerPanel() {
    const [timers, setTimers] = useState<Timer[]>([])
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [newTimer, setNewTimer] = useState({
        taskName: "",
        hours: 0,
        minutes: 25,
        seconds: 0,
        chakraTone: "heart",
    })
    const intervalRef = useRef<NodeJS.Timeout | null>(null)
    const audioContextRef = useRef<AudioContext | null>(null)

    useEffect(() => {
        // Initialize audio context
        if (typeof window !== "undefined") {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
        }

        // Listen for keyboard shortcuts
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
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
            window.removeEventListener("create-new-timer", handleCreateTimer)
            window.removeEventListener("toggle-active-timer", handleToggleTimer)
        }
    }, [timers])

    useEffect(() => {
        // Timer countdown logic
        if (timers.some((timer) => timer.isActive && !timer.isPaused)) {
            intervalRef.current = setInterval(() => {
                setTimers((prev) =>
                    prev.map((timer) => {
                        if (timer.isActive && !timer.isPaused && timer.remaining > 0) {
                            const newRemaining = timer.remaining - 1

                            // Play completion sound when timer reaches 0
                            if (newRemaining === 0) {
                                playChakraTone(timer.chakraTone)
                                return { ...timer, remaining: 0, isActive: false }
                            }

                            return { ...timer, remaining: newRemaining }
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

    const playChakraTone = (toneType: string) => {
        if (!audioContextRef.current) return

        const tone = chakraTones.find((t) => t.value === toneType)
        if (!tone) return

        const oscillator = audioContextRef.current.createOscillator()
        const gainNode = audioContextRef.current.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContextRef.current.destination)

        oscillator.frequency.setValueAtTime(tone.frequency, audioContextRef.current.currentTime)
        oscillator.type = "sine"

        gainNode.gain.setValueAtTime(0, audioContextRef.current.currentTime)
        gainNode.gain.linearRampToValueAtTime(0.3, audioContextRef.current.currentTime + 0.1)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 2)

        oscillator.start(audioContextRef.current.currentTime)
        oscillator.stop(audioContextRef.current.currentTime + 2)
    }

    const createTimer = () => {
        if (!newTimer.taskName.trim()) return

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
            chakraTone: newTimer.chakraTone,
        }

        setTimers((prev) => [...prev, timer])
        setNewTimer({ taskName: "", hours: 0, minutes: 25, seconds: 0, chakraTone: "heart" })
        setShowCreateForm(false)
    }

    const startTimer = (id: string) => {
        setTimers((prev) => prev.map((timer) => (timer.id === id ? { ...timer, isActive: true, isPaused: false } : timer)))
    }

    const pauseTimer = (id: string) => {
        setTimers((prev) => prev.map((timer) => (timer.id === id ? { ...timer, isPaused: !timer.isPaused } : timer)))
    }

    const stopTimer = (id: string) => {
        setTimers((prev) => prev.map((timer) => (timer.id === id ? { ...timer, isActive: false, isPaused: false } : timer)))
    }

    const resetTimer = (id: string) => {
        setTimers((prev) =>
            prev.map((timer) =>
                timer.id === id ? { ...timer, remaining: timer.totalSeconds, isActive: false, isPaused: false } : timer,
            ),
        )
    }

    const deleteTimer = (id: string) => {
        setTimers((prev) => prev.filter((timer) => timer.id !== id))
    }

    const formatTime = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600)
        const mins = Math.floor((seconds % 3600) / 60)
        const secs = seconds % 60

        if (hrs > 0) {
            return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
        }
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }

    const getProgress = (timer: Timer) => {
        return ((timer.totalSeconds - timer.remaining) / timer.totalSeconds) * 100
    }

    return (
        <div className="space-y-4">
            {/* Create Timer Button */}
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Focus Timers</h2>
                <Button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    size="sm"
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                    <Plus className="h-4 w-4 mr-1" />
                    New Timer
                </Button>
            </div>

            {/* Create Timer Form */}
            {showCreateForm && (
                <Card className="animate-slide-down">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-serif">Create New Timer</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <Input
                                placeholder="Timer name..."
                                value={newTimer.taskName}
                                onChange={(e) => setNewTimer((prev) => ({ ...prev, taskName: e.target.value }))}
                                className="h-8 text-sm"
                            />
                        </div>

                        <div className="grid grid-cols-4 gap-2">
                            <div>
                                <label className="text-xs text-slate-600 dark:text-slate-400">Hours</label>
                                <Input
                                    type="number"
                                    min="0"
                                    max="23"
                                    value={newTimer.hours}
                                    onChange={(e) => setNewTimer((prev) => ({ ...prev, hours: Number.parseInt(e.target.value) || 0 }))}
                                    className="h-8 text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-slate-600 dark:text-slate-400">Minutes</label>
                                <Input
                                    type="number"
                                    min="0"
                                    max="59"
                                    value={newTimer.minutes}
                                    onChange={(e) => setNewTimer((prev) => ({ ...prev, minutes: Number.parseInt(e.target.value) || 0 }))}
                                    className="h-8 text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-slate-600 dark:text-slate-400">Seconds</label>
                                <Input
                                    type="number"
                                    min="0"
                                    max="59"
                                    value={newTimer.seconds}
                                    onChange={(e) => setNewTimer((prev) => ({ ...prev, seconds: Number.parseInt(e.target.value) || 0 }))}
                                    className="h-8 text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-slate-600 dark:text-slate-400">Tone</label>
                                <Select
                                    value={newTimer.chakraTone}
                                    onValueChange={(value) => setNewTimer((prev) => ({ ...prev, chakraTone: value }))}
                                >
                                    <SelectTrigger className="h-8 text-sm">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {chakraTones.map((tone) => (
                                            <SelectItem key={tone.value} value={tone.value} className="text-sm">
                                                {tone.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button onClick={createTimer} size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">
                                Create
                            </Button>
                            <Button onClick={() => setShowCreateForm(false)} variant="outline" size="sm">
                                Cancel
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Active Timers */}
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {timers.map((timer) => (
                    <Card
                        key={timer.id}
                        className={`transition-all duration-200 hover:shadow-md ${timer.isActive ? "ring-1 ring-orange-500" : ""} animate-fade-in`}
                    >
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center justify-between text-sm">
                                <span className="truncate">{timer.taskName}</span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => playChakraTone(timer.chakraTone)}
                                    className="h-6 w-6 p-0"
                                >
                                    <Volume2 className="h-3 w-3" />
                                </Button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {/* Timer Display */}
                            <div className="text-center">
                                <div className="text-2xl font-mono font-bold text-slate-800 dark:text-slate-100">
                                    {formatTime(timer.remaining)}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                    {chakraTones.find((t) => t.value === timer.chakraTone)?.label}
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <Progress value={getProgress(timer)} className="h-1" />

                            {/* Controls */}
                            <div className="flex gap-1 justify-center">
                                {!timer.isActive ? (
                                    <Button
                                        onClick={() => startTimer(timer.id)}
                                        size="sm"
                                        className="bg-green-500 hover:bg-green-600 text-white h-7 px-2 text-xs"
                                    >
                                        <Play className="h-3 w-3 mr-1" />
                                        Start
                                    </Button>
                                ) : (
                                    <Button onClick={() => pauseTimer(timer.id)} size="sm" variant="outline" className="h-7 px-2 text-xs">
                                        <Pause className="h-3 w-3 mr-1" />
                                        {timer.isPaused ? "Resume" : "Pause"}
                                    </Button>
                                )}

                                <Button onClick={() => stopTimer(timer.id)} size="sm" variant="outline" className="h-7 px-2 text-xs">
                                    <Square className="h-3 w-3" />
                                </Button>

                                <Button onClick={() => resetTimer(timer.id)} size="sm" variant="outline" className="h-7 px-2 text-xs">
                                    <RotateCcw className="h-3 w-3" />
                                </Button>
                            </div>

                            {/* Status */}
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
                        Start a focused session with chakra-aligned tones.
                    </p>
                    <Button
                        onClick={() => setShowCreateForm(true)}
                        size="sm"
                        className="bg-orange-500 hover:bg-orange-600 text-white"
                    >
                        Create Timer
                    </Button>
                </div>
            )}
        </div>
    )
}
