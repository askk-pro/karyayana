"use client"

import { Button } from "@/components/ui/button"

interface EmptyTimerStateProps {
  onCreateTimer: () => void
}

export function EmptyTimerState({ onCreateTimer }: EmptyTimerStateProps) {
  return (
    <div className="text-center py-12 animate-fade-in">
      <div className="text-4xl mb-3">⏰</div>
      <h3 className="text-lg font-serif font-medium text-slate-700 dark:text-slate-300 mb-2">
        Create Your First Timer
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
        Start a focused session with your custom sounds.
      </p>
      <Button onClick={onCreateTimer} className="bg-orange-500 hover:bg-orange-600 text-white h-8 px-3 text-sm">
        Create Timer
      </Button>
    </div>
  )
}
