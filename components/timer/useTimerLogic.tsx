"use client"

import type React from "react"

import { useCallback, useEffect, useRef } from "react"

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

export function useTimerLogic(
  timers: Timer[],
  setTimers: React.Dispatch<React.SetStateAction<Timer[]>>,
  globalMuted: boolean,
  setGlobalMuted: React.Dispatch<React.SetStateAction<boolean>>,
) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const completedTimersRef = useRef<Set<string>>(new Set())
  const activeAudioRef = useRef<Map<string, HTMLAudioElement>>(new Map())

  // Calculate remaining time based on system timestamp (synchronous)
  const calculateRemainingTime = useCallback((timer: Timer, currentTimestamp: number): number => {
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
  }, [])

  // Stop timer audio
  const stopTimerAudio = useCallback((timerId: string) => {
    const audio = activeAudioRef.current.get(timerId)
    if (audio) {
      audio.pause()
      audio.currentTime = 0
      activeAudioRef.current.delete(timerId)
    }

    // Also cancel notification
    if (typeof window !== "undefined" && window.electronAPI?.cancelTimerNotification) {
      window.electronAPI.cancelTimerNotification(timerId)
    }
  }, [])

  // Listen for stop audio events from Electron
  useEffect(() => {
    const handleStopAudio = (event: any, timerId: string) => {
      stopTimerAudio(timerId)
    }

    if (typeof window !== "undefined" && window.electronAPI?.on) {
      window.electronAPI.on("stop-timer-audio", handleStopAudio)
    }

    return () => {
      if (typeof window !== "undefined" && window.electronAPI?.removeAllListeners) {
        window.electronAPI.removeAllListeners("stop-timer-audio")
      }
    }
  }, [stopTimerAudio])

  // Auto-save timers to database with immediate saves
  const saveTimerToDatabase = useCallback(async (timer: Timer) => {
    if (typeof window !== "undefined" && window.electronAPI?.updateTimer) {
      try {
        console.log("Saving timer to database:", timer.id, timer.taskName)
        await window.electronAPI.updateTimer({
          id: timer.id,
          taskName: timer.taskName,
          hours: timer.hours,
          minutes: timer.minutes,
          seconds: timer.seconds,
          totalSeconds: timer.totalSeconds,
          remaining: timer.remaining,
          isActive: timer.isActive,
          isPaused: timer.isPaused,
          soundId: timer.soundId,
          soundUrl: timer.soundUrl,
          soundName: timer.soundName,
          isRepeating: timer.isRepeating || false,
          repeatInterval: timer.repeatInterval || 0,
          isNegative: timer.isNegative || false,
          isMuted: timer.isMuted || false,
          primaryColor: timer.primaryColor,
          secondaryColor: timer.secondaryColor,
          fontFamily: timer.fontFamily,
          fontSize: timer.fontSize,
          startTimestamp: timer.startTimestamp,
          pauseTimestamp: timer.pauseTimestamp,
          totalPausedDuration: timer.totalPausedDuration,
          lastStartedAt: timer.lastStartedAt,
          lastPausedAt: timer.lastPausedAt,
        })
        console.log("Timer saved successfully:", timer.id)
      } catch (error) {
        console.error("Error saving timer:", error)
      }
    }
  }, [])

  // Synchronous timer countdown logic using system timestamps
  useEffect(() => {
    if (timers.some((t) => t.isActive && !t.isPaused)) {
      intervalRef.current = setInterval(() => {
        const currentTimestamp = Date.now()

        setTimers((prev) =>
          prev.map((timer) => {
            if (timer.isActive && !timer.isPaused) {
              const remaining = calculateRemainingTime(timer, currentTimestamp)

              // Check for timer completion
              if (remaining <= 0 && timer.isNegative !== true && !completedTimersRef.current.has(timer.id)) {
                completedTimersRef.current.add(timer.id)

                // Play completion sound with proper mute handling
                if (globalMuted !== true && timer.isMuted !== true && timer.soundUrl) {
                  try {
                    // Create audio with proper settings for cross-tab playback
                    const audio = new Audio(timer.soundUrl)
                    audio.crossOrigin = "anonymous"
                    audio.preload = "auto"
                    audio.volume = 1.0

                    // Store reference for potential cancellation
                    activeAudioRef.current.set(timer.id, audio)

                    // Ensure audio plays even when tab is not focused
                    const playPromise = audio.play()
                    if (playPromise !== undefined) {
                      playPromise.catch((error) => {
                        console.error("Audio playback failed:", error)
                        activeAudioRef.current.delete(timer.id)
                      })
                    }

                    // Remove from active audio when finished
                    audio.addEventListener("ended", () => {
                      activeAudioRef.current.delete(timer.id)
                    })
                  } catch (error) {
                    console.error("Error creating audio:", error)
                  }
                }

                if (timer.isRepeating === true && timer.repeatInterval && timer.repeatInterval > 0) {
                  // Restart timer after interval
                  setTimeout(() => {
                    const newStartTimestamp = Date.now()
                    setTimers((prevTimers) =>
                      prevTimers.map((t) =>
                        t.id === timer.id
                          ? {
                              ...t,
                              remaining: t.totalSeconds,
                              isActive: true,
                              isPaused: false,
                              startTimestamp: newStartTimestamp,
                              totalPausedDuration: 0,
                            }
                          : t,
                      ),
                    )
                    completedTimersRef.current.delete(timer.id)
                  }, timer.repeatInterval * 1000)

                  return { ...timer, remaining: 0, isActive: false }
                } else {
                  // Stop timer
                  return { ...timer, remaining: 0, isActive: false }
                }
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
  }, [timers, globalMuted, calculateRemainingTime, setTimers])

  const createTimer = useCallback(
    async (data: {
      taskName: string
      hours: number
      minutes: number
      seconds: number
      soundUrl: string
      soundName: string
      soundId: string
      isRepeating: boolean
      repeatInterval: number
      isNegative: boolean
      primaryColor: string
      secondaryColor: string
      fontFamily: string
      fontSize: string
    }) => {
      console.log("Creating timer with:", data)

      const totalSeconds = data.hours * 3600 + data.minutes * 60 + data.seconds

      const timer: Timer = {
        id: Date.now().toString(),
        taskName: data.taskName,
        hours: data.hours,
        minutes: data.minutes,
        seconds: data.seconds,
        totalSeconds,
        remaining: totalSeconds,
        isActive: false,
        isPaused: false,
        soundUrl: data.soundUrl,
        soundName: data.soundName,
        soundId: data.soundId,
        isRepeating: data.isRepeating,
        repeatInterval: data.repeatInterval,
        isNegative: data.isNegative,
        isMuted: false,
        primaryColor: data.primaryColor,
        secondaryColor: data.secondaryColor,
        fontFamily: data.fontFamily,
        fontSize: data.fontSize,
        totalPausedDuration: 0,
      }

      console.log("Created timer:", timer)

      // Save to database FIRST
      if (typeof window !== "undefined" && window.electronAPI?.saveTimer) {
        try {
          console.log("Saving new timer to database...")
          await window.electronAPI.saveTimer(timer)
          console.log("New timer saved to database successfully")
        } catch (error) {
          console.error("Error saving timer to database:", error)
          // Don't add to state if database save failed
          return
        }
      }

      // Only add to state after successful database save
      setTimers((prev) => {
        const newTimers = [...prev, timer]
        console.log("Added timer to state. Total timers:", newTimers.length)
        return newTimers
      })
    },
    [setTimers],
  )

  const createTimerFromJson = useCallback(
    async (timerData: any) => {
      console.log("Creating timer from JSON:", timerData)

      // Save to database FIRST
      if (typeof window !== "undefined" && window.electronAPI?.saveTimer) {
        try {
          await window.electronAPI.saveTimer(timerData)
        } catch (error) {
          console.error("Error saving timer to database:", error)
          return
        }
      }

      setTimers((prev) => [...prev, timerData])
    },
    [setTimers],
  )

  const updateTimer = useCallback(
    async (updatedTimer: Timer) => {
      console.log("Updating timer:", updatedTimer.id)

      // Save to database first
      await saveTimerToDatabase(updatedTimer)

      // Then update state
      setTimers((prev) => prev.map((t) => (t.id === updatedTimer.id ? updatedTimer : t)))
    },
    [saveTimerToDatabase, setTimers],
  )

  const updateTimerOrder = useCallback(
    async (newTimers: Timer[]) => {
      // Update local state immediately
      setTimers(newTimers)

      // Save order to database
      if (typeof window !== "undefined" && window.electronAPI?.updateTimerOrder) {
        try {
          const timerOrders = newTimers.map((timer, index) => ({
            id: timer.id,
            order: index,
          }))
          await window.electronAPI.updateTimerOrder(timerOrders)
        } catch (error) {
          console.error("Error updating timer order:", error)
        }
      }
    },
    [setTimers],
  )

  const startTimer = useCallback(
    async (id: string) => {
      console.log("Starting timer:", id)

      const currentTimestamp = (await window.electronAPI?.getCurrentTimestamp()) || Date.now()

      setTimers((prev) => {
        const newTimers = prev.map((t) => {
          if (t.id === id) {
            const updatedTimer = {
              ...t,
              isActive: true,
              isPaused: false,
              startTimestamp: currentTimestamp,
              totalPausedDuration: 0,
              lastStartedAt: new Date().toISOString(),
            }

            // Save to database immediately
            saveTimerToDatabase(updatedTimer)

            return updatedTimer
          }
          return t
        })

        console.log(
          "Timer started, new state:",
          newTimers.find((t) => t.id === id),
        )
        return newTimers
      })

      completedTimersRef.current.delete(id)
    },
    [saveTimerToDatabase, setTimers],
  )

  const pauseTimer = useCallback(
    async (id: string) => {
      console.log("Pausing/Resuming timer:", id)

      const currentTimestamp = (await window.electronAPI?.getCurrentTimestamp()) || Date.now()

      setTimers((prev) =>
        prev.map((t) => {
          if (t.id === id) {
            let updatedTimer

            if (t.isPaused) {
              // Resuming - add paused duration and update start timestamp
              const pausedDuration = t.pauseTimestamp ? Math.floor((currentTimestamp - t.pauseTimestamp) / 1000) : 0
              updatedTimer = {
                ...t,
                isPaused: false,
                pauseTimestamp: undefined,
                totalPausedDuration: (t.totalPausedDuration || 0) + pausedDuration,
                lastPausedAt: undefined,
              }
            } else {
              // Pausing
              updatedTimer = {
                ...t,
                isPaused: true,
                pauseTimestamp: currentTimestamp,
                lastPausedAt: new Date().toISOString(),
              }
            }

            // Save to database immediately
            saveTimerToDatabase(updatedTimer)

            return updatedTimer
          }
          return t
        }),
      )
    },
    [saveTimerToDatabase, setTimers],
  )

  const stopTimer = useCallback(
    (id: string) => {
      console.log("Stopping timer:", id)

      // Stop any playing audio for this timer
      stopTimerAudio(id)

      setTimers((prev) =>
        prev.map((t) => {
          if (t.id === id) {
            const updatedTimer = {
              ...t,
              isActive: false,
              isPaused: false,
              startTimestamp: undefined,
              pauseTimestamp: undefined,
              totalPausedDuration: 0,
            }

            // Save to database immediately
            saveTimerToDatabase(updatedTimer)

            return updatedTimer
          }
          return t
        }),
      )
      completedTimersRef.current.delete(id)
    },
    [saveTimerToDatabase, setTimers, stopTimerAudio],
  )

  const resetTimer = useCallback(
    (id: string) => {
      console.log("Resetting timer:", id)

      // Stop any playing audio for this timer
      stopTimerAudio(id)

      setTimers((prev) =>
        prev.map((t) => {
          if (t.id === id) {
            const updatedTimer = {
              ...t,
              remaining: t.totalSeconds,
              isActive: false,
              isPaused: false,
              startTimestamp: undefined,
              pauseTimestamp: undefined,
              totalPausedDuration: 0,
            }

            // Save to database immediately
            saveTimerToDatabase(updatedTimer)

            return updatedTimer
          }
          return t
        }),
      )
      completedTimersRef.current.delete(id)
    },
    [saveTimerToDatabase, setTimers, stopTimerAudio],
  )

  const deleteTimer = useCallback(
    async (id: string) => {
      console.log("Deleting timer:", id)

      // Stop any playing audio for this timer
      stopTimerAudio(id)

      // Delete from database first
      if (typeof window !== "undefined" && window.electronAPI?.deleteTimer) {
        try {
          const success = await window.electronAPI.deleteTimer(id)
          console.log("Timer deleted from database:", success)
        } catch (error) {
          console.error("Error deleting timer from database:", error)
          return // Don't remove from state if database delete failed
        }
      }

      setTimers((prev) => {
        const newTimers = prev.filter((t) => t.id !== id)
        console.log("Timer removed from state. Remaining timers:", newTimers.length)
        return newTimers
      })
      completedTimersRef.current.delete(id)
    },
    [setTimers, stopTimerAudio],
  )

  const toggleTimerMute = useCallback(
    (id: string) => {
      setTimers((prev) =>
        prev.map((t) => {
          if (t.id === id) {
            const updatedTimer = { ...t, isMuted: t.isMuted !== true }
            saveTimerToDatabase(updatedTimer)
            return updatedTimer
          }
          return t
        }),
      )
    },
    [saveTimerToDatabase, setTimers],
  )

  const toggleGlobalMute = useCallback(async () => {
    const newMuted = !globalMuted
    setGlobalMuted(newMuted)

    // Stop all playing audio if muting
    if (newMuted) {
      activeAudioRef.current.forEach((audio, timerId) => {
        stopTimerAudio(timerId)
      })
    }

    // Save to database
    if (typeof window !== "undefined" && window.electronAPI?.setAppSetting) {
      try {
        await window.electronAPI.setAppSetting({ key: "global_mute", value: newMuted.toString() })
      } catch (error) {
        console.error("Error saving global mute setting:", error)
      }
    }
  }, [globalMuted, setGlobalMuted, stopTimerAudio])

  return {
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
    stopTimerAudio,
  }
}
