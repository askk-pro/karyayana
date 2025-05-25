"use client"

interface TimerStatusProps {
  remaining: number
  isActive: boolean
  isPaused: boolean
  isRepeating?: boolean
  isNegative?: boolean
}

export function TimerStatus({ remaining, isActive, isPaused, isRepeating, isNegative }: TimerStatusProps) {
  if (remaining === 0 && !isNegative) {
    if (isRepeating) {
      return <span className="text-blue-600 font-medium">🔄 Restarting...</span>
    }
    return <span className="text-green-600 font-medium">✨ Completed!</span>
  }

  if (remaining < 0 && isNegative) {
    return <span className="text-red-600 font-medium">⏰ Overtime</span>
  }

  if (isActive && remaining > 0) {
    return <span className="text-orange-600 font-medium">{isPaused ? "⏸️ Paused" : "⏱️ Active"}</span>
  }

  return <span className="text-slate-500">Ready</span>
}
