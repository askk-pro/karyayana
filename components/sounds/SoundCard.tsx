"use client"

import type React from "react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Edit, GripVertical, Trash2 } from "lucide-react"
import { useRef, useState } from "react"
import { SoundPreview } from "./SoundPreview"

interface Sound {
  id: string
  name: string
  filename: string
  filepath: string
  url: string
  duration?: number
  volume?: number
  start_time?: number
  end_time?: number
  primary_color?: string
  secondary_color?: string
  created_at: string
  display_order?: number
}

interface SoundCardProps {
  sound: Sound
  onEdit: (sound: Sound) => void
  onDelete: (id: string) => void
  onRename: (id: string, newName: string) => void
  isDragging?: boolean
}

export function SoundCard({ sound, onEdit, onDelete, onRename, isDragging }: SoundCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(sound.name)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleRename = () => {
    if (editName.trim() && editName !== sound.name) {
      onRename(sound.id, editName.trim())
    }
    setIsEditing(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleRename()
    } else if (e.key === "Escape") {
      setEditName(sound.name)
      setIsEditing(false)
    }
  }

  const effectiveDuration = sound.end_time && sound.start_time ? sound.end_time - sound.start_time : sound.duration || 0

  return (
    <>
      <Card
        className={`transition-all duration-200 hover:shadow-md ${isDragging ? "opacity-50" : ""}`}
        style={{
          borderColor: sound.primary_color || "#e5e7eb",
          borderWidth: "2px",
        }}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            {/* Drag Handle */}
            <div className="flex-shrink-0 cursor-grab active:cursor-grabbing">
              <GripVertical className="h-4 w-4 text-slate-400" />
            </div>

            {/* Color Indicator */}
            <div
              className="w-4 h-4 rounded-full border border-slate-300"
              style={{ backgroundColor: sound.primary_color || "#3b82f6" }}
            />

            {/* Sound Preview */}
            <SoundPreview url={sound.url} volume={sound.volume} startTime={sound.start_time} endTime={sound.end_time} />

            {/* Sound Info */}
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <Input
                  ref={inputRef}
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={handleRename}
                  onKeyDown={handleKeyPress}
                  className="h-6 text-sm font-medium"
                  autoFocus
                />
              ) : (
                <h3
                  className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate cursor-pointer hover:text-orange-600"
                  onClick={() => setIsEditing(true)}
                  title="Click to rename"
                >
                  {sound.name}
                </h3>
              )}

              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span>{formatTime(effectiveDuration)}</span>
                {sound.volume && sound.volume !== 1 && <span>• {Math.round(sound.volume * 100)}%</span>}
                <span>• {new Date(sound.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(sound)}
                className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-700"
                title="Edit sound"
              >
                <Edit className="h-3 w-3" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900"
                title="Delete sound"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Sound</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{sound.name}&quot;? This action cannot be undone and will affect any
              timers using this sound.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete(sound.id)
                setShowDeleteDialog(false)
              }}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
