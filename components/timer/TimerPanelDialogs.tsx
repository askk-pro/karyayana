"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { JsonTimerEditor } from "./JsonTimerEditor"
import { TimerEditForm } from "./TimerEditForm"
import { TimerForm } from "./TimerForm"

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
  lastStartedAt?: string
  lastPausedAt?: string
}

interface CustomSound {
  id: string
  name: string
  url: string
}

interface TimerPanelDialogsProps {
  showCreateForm: boolean
  showJsonEditor: boolean
  editingTimer: Timer | null
  sounds: CustomSound[]
  isLoadingSounds: boolean
  onCreateTimer: (data: any) => void
  onCreateTimerFromJson: (data: any) => void
  onUpdateTimer: (timer: Timer) => void
  onCloseCreateForm: () => void
  onCloseJsonEditor: () => void
  onCloseEditForm: () => void
}

export function TimerPanelDialogs({
  showCreateForm,
  showJsonEditor,
  editingTimer,
  sounds,
  isLoadingSounds,
  onCreateTimer,
  onCreateTimerFromJson,
  onUpdateTimer,
  onCloseCreateForm,
  onCloseJsonEditor,
  onCloseEditForm,
}: TimerPanelDialogsProps) {
  return (
    <>
      {/* Create Timer Dialog */}
      <Dialog open={showCreateForm} onOpenChange={(open) => !open && onCloseCreateForm()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Timer</DialogTitle>
          </DialogHeader>
          <TimerForm
            onCreateTimer={onCreateTimer}
            onCancel={onCloseCreateForm}
            sounds={sounds}
            isLoadingSounds={isLoadingSounds}
          />
        </DialogContent>
      </Dialog>

      {/* JSON Editor Dialog */}
      <Dialog open={showJsonEditor} onOpenChange={(open) => !open && onCloseJsonEditor()}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Timer with JSON</DialogTitle>
          </DialogHeader>
          <JsonTimerEditor onCreateTimer={onCreateTimerFromJson} onCancel={onCloseJsonEditor} sounds={sounds} />
        </DialogContent>
      </Dialog>

      {/* Edit Timer Dialog */}
      <Dialog open={!!editingTimer} onOpenChange={(open) => !open && onCloseEditForm()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Timer</DialogTitle>
          </DialogHeader>
          {editingTimer && (
            <TimerEditForm
              timer={editingTimer}
              onUpdateTimer={onUpdateTimer}
              onCancel={onCloseEditForm}
              sounds={sounds}
              isLoadingSounds={isLoadingSounds}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
