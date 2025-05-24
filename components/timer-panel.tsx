"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Play, Pause, Square, RotateCcw, Volume2 } from "lucide-react"

interface Timer {
    id: string
    taskName: string
    duration: number // in seconds
    remaining: number
    isActive: boolean
    isPaused: boolean
    chakraTone: string
}

const chakraTones = [
    { value: "root", label: "Root Chakra (256 Hz)", frequency: 256 },
    { value: "sacral", label: "Sacral Chakra (288 Hz)", frequency: 288 },
    { value: "solar", label: "Solar Plexus (320 Hz)", frequency: 320 },
    { value: "heart", label: "Heart Chakra (341.3 Hz)", frequency: 341.3 },
    { value: "throat", label: "Throat Chakra (384 Hz)", frequency: 384 },
    { value: "third-eye", label: "Third Eye (426.7 Hz)", frequency: 426.7 },
    { value: "crown", label: "Crown Chakra (480 Hz)", frequency: 480 },
]

export function TimerPanel() {
    const [timers, setTimers] = useState<Timer[]>([])
    const [selectedDuration, setSelectedDuration] = useState("25")
    const [selectedTone, setSelectedTone] = useState("heart")
    const intervalRef = useRef<NodeJS.Timeout | null>(null)
    const audioContextRef = useRef<AudioContext | null>(null)

    useEffect(() => {
        // Initialize audio context
        if (typeof window !== "undefined") {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
        }
    }, [])

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
        const duration = Number.parseInt(selectedDuration) * 60 // convert to seconds
        const newTimer: Timer = {
            id: Date.now().toString(),
            taskName: `Focus Session ${timers.length + 1}`,
            duration,
            remaining: duration,
            isActive: false,
            isPaused: false,
            chakraTone: selectedTone,
        }

        setTimers((prev) => [...prev, newTimer])
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
                timer.id === id ? { ...timer, remaining: timer.duration, isActive: false, isPaused: false } : timer,
            ),
        )
    }

    const deleteTimer = (id: string) => {
        setTimers((prev) => prev.filter((timer) => timer.id !== id))
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }

    const getProgress = (timer: Timer) => {
        return ((timer.duration - timer.remaining) / timer.duration) * 100
    }

    return (
        <div className="space-y-6">
            {/* Create Timer Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="font-serif">Create New Timer</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Duration</label>
                            <Select value={selectedDuration} onValueChange={setSelectedDuration}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="5">5 minutes</SelectItem>
                                    <SelectItem value="15">15 minutes</SelectItem>
                                    <SelectItem value="25">25 minutes (Pomodoro)</SelectItem>
                                    <SelectItem value="45">45 minutes</SelectItem>
                                    <SelectItem value="60">1 hour</SelectItem>
                                    <SelectItem value="90">90 minutes</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Chakra Tone</label>
                            <Select value={selectedTone} onValueChange={setSelectedTone}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {chakraTones.map((tone) => (
                                        <SelectItem key={tone.value} value={tone.value}>
                                            {tone.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-end">
                            <Button onClick={createTimer} className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                                Create Timer
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Active Timers */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {timers.map((timer) => (
                    <Card
                        key={timer.id}
                        className={`transition-all duration-200 ${timer.isActive ? "ring-2 ring-orange-500" : ""}`}
                    >
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center justify-between text-lg">
                                <span>{timer.taskName}</span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => playChakraTone(timer.chakraTone)}
                                    className="h-8 w-8 p-0"
                                >
                                    <Volume2 className="h-4 w-4" />
                                </Button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Timer Display */}
                            <div className="text-center">
                                <div className="text-4xl font-mono font-bold text-slate-800 dark:text-slate-100">
                                    {formatTime(timer.remaining)}
                                </div>
                                <div className="text-sm text-slate-500 dark:text-slate-400">
                                    {chakraTones.find((t) => t.value === timer.chakraTone)?.label}
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <Progress value={getProgress(timer)} className="h-2" />

                            {/* Controls */}
                            <div className="flex gap-2 justify-center">
                                {!timer.isActive ? (
                                    <Button
                                        onClick={() => startTimer(timer.id)}
                                        size="sm"
                                        className="bg-green-500 hover:bg-green-600 text-white"
                                    >
                                        <Play className="h-4 w-4 mr-1" />
                                        Start
                                    </Button>
                                ) : (
                                    <Button onClick={() => pauseTimer(timer.id)} size="sm" variant="outline">
                                        <Pause className="h-4 w-4 mr-1" />
                                        {timer.isPaused ? "Resume" : "Pause"}
                                    </Button>
                                )}

                                <Button onClick={() => stopTimer(timer.id)} size="sm" variant="outline">
                                    <Square className="h-4 w-4 mr-1" />
                                    Stop
                                </Button>

                                <Button onClick={() => resetTimer(timer.id)} size="sm" variant="outline">
                                    <RotateCcw className="h-4 w-4 mr-1" />
                                    Reset
                                </Button>
                            </div>

                            {/* Status */}
                            <div className="text-center text-sm">
                                {timer.remaining === 0 && <span className="text-green-600 font-medium">✨ Completed!</span>}
                                {timer.isActive && timer.remaining > 0 && (
                                    <span className="text-orange-600 font-medium">{timer.isPaused ? "⏸️ Paused" : "⏱️ Active"}</span>
                                )}
                                {!timer.isActive && timer.remaining > 0 && <span className="text-slate-500">Ready to start</span>}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {timers.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">⏰</div>
                    <h3 className="text-xl font-serif font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Create Your First Timer
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">
                        Start a focused session with chakra-aligned tones for mindful productivity.
                    </p>
                </div>
            )}
        </div>
    )
}
