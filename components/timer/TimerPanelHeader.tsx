"use client"

import { Button } from "@/components/ui/button"
import { Code, Maximize2, Plus, Volume2, VolumeX } from "lucide-react"

interface Timer {
  id: string
  isActive: boolean
}

interface TimerPanelHeaderProps {
  timerCount: number
  activeTimer?: Timer
  globalMuted: boolean
  viewMode: "detailed" | "compact"
  onOpenFullScreen: () => void
  onToggleGlobalMute: () => void
  onToggleViewMode: () => void
  onOpenJsonEditor: () => void
  onOpenCreateForm: () => void
}

export function TimerPanelHeader({
  timerCount,
  activeTimer,
  globalMuted,
  viewMode,
  onOpenFullScreen,
  onToggleGlobalMute,
  onToggleViewMode,
  onOpenJsonEditor,
  onOpenCreateForm,
}: TimerPanelHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-lg font-semibold">Focus Timers ({timerCount})</h2>
      <div className="flex gap-2">
        {/* Full Screen Button */}
        {activeTimer && (
          <Button
            onClick={onOpenFullScreen}
            variant="outline"
            size="sm"
            className="h-8 px-3 text-sm"
            title="Open active timer in full screen mode"
          >
            <Maximize2 className="h-4 w-4 mr-1" />
            Full Screen
          </Button>
        )}

        {/* Global Mute Button */}
        <Button
          onClick={onToggleGlobalMute}
          variant={globalMuted ? "default" : "outline"}
          size="sm"
          className={`h-8 px-3 text-sm ${
            globalMuted ? "bg-red-500 hover:bg-red-600 text-white" : "hover:bg-slate-100 dark:hover:bg-slate-700"
          }`}
          title={globalMuted ? "Unmute all timers" : "Mute all timers"}
        >
          {globalMuted ? <VolumeX className="h-4 w-4 mr-1" /> : <Volume2 className="h-4 w-4 mr-1" />}
          {globalMuted ? "Unmute All" : "Mute All"}
        </Button>

        {/* View Toggle Button */}
        <Button
          onClick={onToggleViewMode}
          variant="outline"
          size="sm"
          className="h-8 px-3 text-sm"
          title={`Switch to ${viewMode === "detailed" ? "compact" : "detailed"} view`}
        >
          {viewMode === "detailed" ? "📋 Compact" : "📊 Detailed"}
        </Button>

        {/* JSON Editor Button */}
        <Button
          onClick={onOpenJsonEditor}
          variant="outline"
          size="sm"
          className="h-8 px-3 text-sm"
          title="Create timer using JSON editor"
        >
          <Code className="h-4 w-4 mr-1" />
          JSON Editor
        </Button>

        {/* New Timer Button */}
        <Button
          onClick={onOpenCreateForm}
          className="bg-orange-500 hover:bg-orange-600 text-white h-8 px-3 text-sm"
          title="Create a new timer"
        >
          <Plus className="h-4 w-4 mr-1" /> New Timer
        </Button>
      </div>
    </div>
  )
}
