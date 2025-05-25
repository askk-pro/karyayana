"use client"

import { useEffect, useState } from "react"

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

export function useTimerData() {
  const [timers, setTimers] = useState<Timer[]>([])
  const [sounds, setSounds] = useState<CustomSound[]>([])
  const [isLoadingSounds, setIsLoadingSounds] = useState(false)
  const [globalMuted, setGlobalMuted] = useState(false)

  // Calculate remaining time based on system timestamp (synchronous)
  const calculateRemainingTime = (timer: Timer, currentTimestamp: number): number => {
    if (!timer.isActive || timer.isPaused) {
      return timer.remaining
    }

    const startTime = timer.startTimestamp || currentTimestamp
    const pausedDuration = timer.totalPausedDuration || 0
    const elapsedSeconds = Math.floor((currentTimestamp - startTime) / 1000) - pausedDuration

    if (timer.isNegative === true) {
      return timer.totalSeconds - elapsedSeconds
    } else {
      return Math.max(0, timer.totalSeconds - elapsedSeconds)
    }
  }

  // Load timers from database on mount
  useEffect(() => {
    const loadTimers = async () => {
      if (typeof window !== "undefined" && window.electronAPI?.getTimers) {
        try {
          const dbTimers = await window.electronAPI.getTimers()
          console.log("Loaded timers from database:", dbTimers)

          if (dbTimers.length === 0) {
            console.log("No timers found in database")
            setTimers([])
            return
          }

          const currentTimestamp = (await window.electronAPI.getCurrentTimestamp()) || Date.now()

          const formattedTimers: Timer[] = dbTimers.map((timer) => {
            const baseTimer = {
              id: timer.id,
              taskName: timer.task_name,
              hours: timer.hours,
              minutes: timer.minutes,
              seconds: timer.seconds,
              totalSeconds: timer.total_seconds,
              remaining: timer.remaining_seconds,
              isActive: Boolean(timer.is_active),
              isPaused: Boolean(timer.is_paused),
              soundUrl: timer.sound_url || "",
              soundName: timer.sound_name || "No sound",
              soundId: timer.sound_id || "",
              isRepeating: Boolean(timer.is_repeating),
              repeatInterval: timer.repeat_interval_seconds || 0,
              isNegative: Boolean(timer.is_negative),
              isMuted: Boolean(timer.is_muted),
              primaryColor: timer.primary_color || "#f59e0b",
              secondaryColor: timer.secondary_color || "#fbbf24",
              fontFamily: timer.font_family || "mono",
              fontSize: timer.font_size || "text-2xl",
              startTimestamp: timer.start_timestamp,
              pauseTimestamp: timer.pause_timestamp,
              totalPausedDuration: timer.total_paused_duration || 0,
              lastStartedAt: timer.last_started_at,
              lastPausedAt: timer.last_paused_at,
            }

            // Calculate accurate remaining time based on system timestamp
            if (baseTimer.isActive && !baseTimer.isPaused && baseTimer.startTimestamp) {
              const remaining = calculateRemainingTime(baseTimer, currentTimestamp)
              return { ...baseTimer, remaining }
            }

            return baseTimer
          })

          console.log("Formatted timers:", formattedTimers)
          setTimers(formattedTimers)
        } catch (error) {
          console.error("Error loading timers:", error)
          setTimers([])
        }
      }
    }

    loadTimers()
  }, [])

  // Load global mute setting
  useEffect(() => {
    const loadGlobalMute = async () => {
      if (typeof window !== "undefined" && window.electronAPI?.getAppSetting) {
        try {
          const muted = await window.electronAPI.getAppSetting("global_mute")
          setGlobalMuted(muted === "true")
        } catch (error) {
          console.error("Error loading global mute setting:", error)
        }
      }
    }

    loadGlobalMute()
  }, [])

  // Load sounds from database
  useEffect(() => {
    const loadSounds = async () => {
      setIsLoadingSounds(true)
      try {
        if (typeof window !== "undefined" && window.electronAPI?.getSounds) {
          const dbSounds = await window.electronAPI.getSounds()
          console.log("Loaded sounds from database:", dbSounds)

          const formattedSounds: CustomSound[] = dbSounds.map((sound) => ({
            id: sound.id,
            name: sound.name,
            url: sound.url,
          }))

          setSounds(formattedSounds)
        } else {
          console.log("ElectronAPI not available, checking localStorage...")
          // Fallback to localStorage for web version
          const stored = localStorage.getItem("karyayana-sounds")
          if (stored) {
            const parsed: CustomSound[] = JSON.parse(stored)
            setSounds(parsed)
          }
        }
      } catch (error) {
        console.error("Error loading sounds:", error)
      } finally {
        setIsLoadingSounds(false)
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
    const interval = setInterval(loadSounds, 2000)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      clearInterval(interval)
    }
  }, [])

  return {
    timers,
    setTimers,
    sounds,
    setSounds,
    isLoadingSounds,
    globalMuted,
    setGlobalMuted,
  }
}
