"use client"

import { CircularProgress } from "./CircularProgress"

interface TimerDisplayProps {
  remaining: number
  totalSeconds: number
  soundName: string
  isNegative?: boolean
  primaryColor?: string
  fontFamily?: string
  fontSize?: string
  size?: number
}

export function TimerDisplay({
  remaining,
  totalSeconds,
  soundName,
  isNegative = false,
  primaryColor = "#f59e0b",
  fontFamily = "mono",
  fontSize = "text-2xl",
  size = 200,
}: TimerDisplayProps) {
  const formatTime = (s: number) => {
    const isNeg = s < 0
    const absSeconds = Math.abs(s)
    const hrs = Math.floor(absSeconds / 3600)
    const mins = Math.floor((absSeconds % 3600) / 60)
    const secs = absSeconds % 60

    const timeStr =
      hrs > 0
        ? `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
        : `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`

    return isNeg ? `-${timeStr}` : timeStr
  }

  const getProgress = () => {
    if (isNegative && remaining < 0) {
      // For negative timers, show progress continuing beyond 100%
      return 100 + Math.abs(remaining / totalSeconds) * 100
    }
    return ((totalSeconds - remaining) / totalSeconds) * 100
  }

  const getProgressColor = () => {
    if (isNegative && remaining < 0) {
      return "#ef4444" // Red for negative time
    }
    return primaryColor
  }

  const fontFamilyClass = fontFamily === "mono" ? "font-mono" : fontFamily === "serif" ? "font-serif" : "font-sans"

  // Reduce font size by 20% for full screen as requested
  const adjustedFontSize = fontSize === "text-6xl" ? "text-5xl" : fontSize

  return (
    <div className="flex flex-col items-center space-y-4">
      <CircularProgress
        progress={Math.min(getProgress(), 100)}
        color={getProgressColor()}
        size={size}
        strokeWidth={size > 200 ? 12 : 8}
      >
        <div className="text-center">
          <div className={`${adjustedFontSize} ${fontFamilyClass} font-bold text-slate-800 dark:text-slate-100`}>
            {formatTime(remaining)}
          </div>
          {isNegative && remaining < 0 && <div className="text-sm text-red-500 font-medium">OVERTIME</div>}
        </div>
      </CircularProgress>

      {soundName && soundName !== "No sound" && (
        <div className="text-sm text-slate-500 dark:text-slate-400 truncate max-w-full">🔊 {soundName}</div>
      )}
    </div>
  )
}
