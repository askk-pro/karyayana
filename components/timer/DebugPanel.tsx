"use client"

import { Card, CardContent } from "@/components/ui/card"

interface DebugPanelProps {
  soundCount: number
  timerCount: number
  electronApiAvailable: boolean
}

export function DebugPanel({ soundCount, timerCount, electronApiAvailable }: DebugPanelProps) {
  if (process.env.NODE_ENV !== "development") {
    return null
  }

  return (
    <Card className="bg-slate-50 dark:bg-slate-800">
      <CardContent className="p-3">
        <p className="text-xs text-slate-600">
          Debug: {soundCount} sounds loaded, {timerCount} timers created
        </p>
        <p className="text-xs text-slate-600">ElectronAPI available: {electronApiAvailable ? "Yes" : "No"}</p>
      </CardContent>
    </Card>
  )
}
