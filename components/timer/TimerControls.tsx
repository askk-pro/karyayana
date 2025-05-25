"use client"

import { Button } from "@/components/ui/button"
import { Pause, Play, RotateCcw, Square } from "lucide-react"

interface TimerControlsProps {
  isActive: boolean
  isPaused: boolean
  onStart: () => void
  onPause: () => void
  onStop: () => void
  onReset: () => void
  size?: "sm" | "lg"
}

export function TimerControls({
  isActive,
  isPaused,
  onStart,
  onPause,
  onStop,
  onReset,
  size = "sm",
}: TimerControlsProps) {
  const buttonSize = size === "lg" ? "lg" : "sm"
  const buttonClass = size === "lg" ? "h-12 px-6 text-lg" : "h-7 px-2 text-xs"
  const iconClass = size === "lg" ? "h-5 w-5 mr-2" : "h-3 w-3 mr-1"

  return (
    <div className="flex gap-2 justify-center">
      {!isActive ? (
        <Button
          onClick={onStart}
          size={buttonSize}
          className={`${buttonClass} bg-green-500 hover:bg-green-600`}
          title="Start the timer"
        >
          <Play className={iconClass} />
          Start
        </Button>
      ) : (
        <>
          <Button
            onClick={onPause}
            size={buttonSize}
            variant="outline"
            className={buttonClass}
            title={isPaused ? "Resume the timer" : "Pause the timer"}
          >
            {isPaused ? <Play className={iconClass} /> : <Pause className={iconClass} />}
            {isPaused ? "Resume" : "Pause"}
          </Button>
          <Button onClick={onStop} size={buttonSize} variant="outline" className={buttonClass} title="Stop the timer">
            <Square className={iconClass} />
            Stop
          </Button>
        </>
      )}
      <Button
        onClick={onReset}
        size={buttonSize}
        variant="outline"
        className={buttonClass}
        title="Reset timer to original duration"
      >
        <RotateCcw className={iconClass} />
        Reset
      </Button>
    </div>
  )
}
