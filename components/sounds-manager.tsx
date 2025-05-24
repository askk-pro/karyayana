"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Play, Pause, Trash2, Volume2 } from "lucide-react"

interface CustomSound {
    id: string
    name: string
    file: File
    url: string
    duration?: number
}

export function SoundsManager() {
    const [customSounds, setCustomSounds] = useState<CustomSound[]>([])
    const [playingSound, setPlayingSound] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const audioRef = useRef<HTMLAudioElement>(null)

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files
        if (!files) return

        Array.from(files).forEach((file) => {
            if (file.type.startsWith("audio/")) {
                const url = URL.createObjectURL(file)
                const sound: CustomSound = {
                    id: Date.now().toString() + Math.random(),
                    name: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
                    file,
                    url,
                }

                // Get duration
                const audio = new Audio(url)
                audio.addEventListener("loadedmetadata", () => {
                    setCustomSounds((prev) => prev.map((s) => (s.id === sound.id ? { ...s, duration: audio.duration } : s)))
                })

                setCustomSounds((prev) => [...prev, sound])
            }
        })

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    const playSound = (sound: CustomSound) => {
        if (playingSound === sound.id) {
            // Stop current sound
            if (audioRef.current) {
                audioRef.current.pause()
                audioRef.current.currentTime = 0
            }
            setPlayingSound(null)
        } else {
            // Play new sound
            if (audioRef.current) {
                audioRef.current.src = sound.url
                audioRef.current.play()
                setPlayingSound(sound.id)

                audioRef.current.onended = () => {
                    setPlayingSound(null)
                }
            }
        }
    }

    const deleteSound = (id: string) => {
        const sound = customSounds.find((s) => s.id === id)
        if (sound) {
            URL.revokeObjectURL(sound.url)
            setCustomSounds((prev) => prev.filter((s) => s.id !== id))

            if (playingSound === id) {
                setPlayingSound(null)
                if (audioRef.current) {
                    audioRef.current.pause()
                }
            }
        }
    }

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins}:${secs.toString().padStart(2, "0")}`
    }

    return (
        <div className="space-y-6">
            <audio ref={audioRef} />

            {/* Upload Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="font-serif">Upload Custom Sounds</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center hover:border-orange-400 transition-colors">
                        <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">Upload Audio Files</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                            Drag and drop audio files here, or click to browse
                        </p>
                        <Button
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-orange-500 hover:bg-orange-600 text-white"
                        >
                            Choose Files
                        </Button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="audio/*"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                        <p className="text-xs text-slate-400 mt-2">Supports MP3, WAV, OGG, and other audio formats</p>
                    </div>
                </CardContent>
            </Card>

            {/* Custom Sounds Library */}
            {customSounds.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="font-serif">Your Sound Library</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                            {customSounds.map((sound) => (
                                <div
                                    key={sound.id}
                                    className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                >
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => playSound(sound)}
                                        className={`h-8 w-8 p-0 ${playingSound === sound.id ? "text-orange-500" : ""}`}
                                    >
                                        {playingSound === sound.id ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                                    </Button>

                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{sound.name}</p>
                                        {sound.duration && (
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{formatDuration(sound.duration)}</p>
                                        )}
                                    </div>

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => deleteSound(sound.id)}
                                        className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Built-in Chakra Tones */}
            <Card>
                <CardHeader>
                    <CardTitle className="font-serif">Built-in Chakra Tones</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                        {[
                            { name: "Root Chakra", frequency: "256 Hz", color: "bg-red-500" },
                            { name: "Sacral Chakra", frequency: "288 Hz", color: "bg-orange-500" },
                            { name: "Solar Plexus", frequency: "320 Hz", color: "bg-yellow-500" },
                            { name: "Heart Chakra", frequency: "341.3 Hz", color: "bg-green-500" },
                            { name: "Throat Chakra", frequency: "384 Hz", color: "bg-blue-500" },
                            { name: "Third Eye", frequency: "426.7 Hz", color: "bg-indigo-500" },
                            { name: "Crown Chakra", frequency: "480 Hz", color: "bg-purple-500" },
                        ].map((tone) => (
                            <div
                                key={tone.name}
                                className="flex items-center gap-3 p-2 border border-slate-200 dark:border-slate-700 rounded-lg"
                            >
                                <div className={`w-3 h-3 rounded-full ${tone.color}`} />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{tone.name}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{tone.frequency}</p>
                                </div>
                                <Volume2 className="h-4 w-4 text-slate-400" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {customSounds.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">🎵</div>
                    <h3 className="text-xl font-serif font-medium text-slate-700 dark:text-slate-300 mb-2">Upload Your Sounds</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">
                        Add your own meditation bells, nature sounds, or focus music to enhance your practice.
                    </p>
                </div>
            )}
        </div>
    )
}
