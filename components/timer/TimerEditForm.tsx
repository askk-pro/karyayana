"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type React from "react"
import { useEffect, useRef, useState } from "react"
import { SoundSelector } from "./SoundSelector"
import { TimerCustomization } from "./TimerCustomization"

interface CustomSound {
  id: string
  name: string
  url: string
}

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

interface TimerEditFormProps {
  timer: Timer
  onUpdateTimer: (timer: Timer) => void
  onCancel: () => void
  sounds: CustomSound[]
  isLoadingSounds: boolean
}

export function TimerEditForm({ timer, onUpdateTimer, onCancel, sounds, isLoadingSounds }: TimerEditFormProps) {
  const [formData, setFormData] = useState({
    taskName: timer.taskName,
    hours: timer.hours,
    minutes: timer.minutes,
    seconds: timer.seconds,
    isRepeating: timer.isRepeating || false,
    repeatInterval: timer.repeatInterval || 300,
    isNegative: timer.isNegative || false,
    primaryColor: timer.primaryColor || "#f59e0b",
    secondaryColor: timer.secondaryColor || "#fbbf24",
    fontFamily: timer.fontFamily || "mono",
    fontSize: timer.fontSize || "text-2xl",
  })

  const [selectedSound, setSelectedSound] = useState<CustomSound | null>(null)
  const [errors, setErrors] = useState<{ taskName?: string; duration?: string; repeatInterval?: string }>({})

  const taskNameRef = useRef<HTMLInputElement>(null)

  // Auto-focus on task name input when form opens
  useEffect(() => {
    if (taskNameRef.current) {
      taskNameRef.current.focus()
    }
  }, [])

  // Update selected sound when sounds change or timer changes
  useEffect(() => {
    if (sounds.length > 0) {
      const sound = sounds.find((s) => s.id === timer.soundId)
      setSelectedSound(sound || null)
    }
  }, [sounds, timer.soundId])

  const validateForm = () => {
    const newErrors: { taskName?: string; duration?: string; repeatInterval?: string } = {}

    // Validate timer name
    if (!formData.taskName.trim()) {
      newErrors.taskName = "Please enter a timer name"
    }

    // Calculate total seconds
    const totalSeconds = formData.hours * 3600 + formData.minutes * 60 + formData.seconds
    if (totalSeconds === 0) {
      newErrors.duration = "Please set a duration greater than 0"
    }

    // Validate repeat interval if repeating is enabled
    if (formData.isRepeating && formData.repeatInterval <= 0) {
      newErrors.repeatInterval = "Repeat interval must be greater than 0"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validateForm()) {
      if (errors.taskName && taskNameRef.current) {
        taskNameRef.current.focus()
      }
      return
    }

    const totalSeconds = formData.hours * 3600 + formData.minutes * 60 + formData.seconds

    const updatedTimer: Timer = {
      ...timer,
      taskName: formData.taskName,
      hours: formData.hours,
      minutes: formData.minutes,
      seconds: formData.seconds,
      totalSeconds,
      // Only update remaining if timer is not active
      remaining: timer.isActive ? timer.remaining : totalSeconds,
      soundUrl: selectedSound?.url || "",
      soundName: selectedSound?.name || "No sound",
      soundId: selectedSound?.id || "",
      isRepeating: formData.isRepeating,
      repeatInterval: formData.repeatInterval,
      isNegative: formData.isNegative,
      primaryColor: formData.primaryColor,
      secondaryColor: formData.secondaryColor,
      fontFamily: formData.fontFamily,
      fontSize: formData.fontSize,
    }

    onUpdateTimer(updatedTimer)
    setErrors({})
  }

  const updateField = (field: string, value: string | number | boolean) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value }

      // Mutual exclusivity: if one is enabled, disable the other
      if (field === "isRepeating" && value === true) {
        newData.isNegative = false
      } else if (field === "isNegative" && value === true) {
        newData.isRepeating = false
      }

      return newData
    })

    // Clear errors when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="space-y-4">
      {/* Timer Name */}
      <div>
        <Input
          ref={taskNameRef}
          placeholder="Timer name..."
          value={formData.taskName}
          onChange={(e) => updateField("taskName", e.target.value)}
          onKeyPress={handleKeyPress}
          className={`h-8 text-sm ${errors.taskName ? "border-red-500 focus:border-red-500" : ""}`}
        />
        {errors.taskName && <p className="text-xs text-red-500 mt-1 animate-slide-down">{errors.taskName}</p>}
      </div>

      {/* Duration */}
      <div>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="text-xs text-slate-600 dark:text-slate-400">Hours</label>
            <Input
              type="number"
              min={0}
              max={23}
              value={formData.hours}
              onChange={(e) => updateField("hours", +e.target.value || 0)}
              onKeyPress={handleKeyPress}
              className={`h-8 text-sm ${errors.duration ? "border-red-500" : ""}`}
            />
          </div>
          <div>
            <label className="text-xs text-slate-600 dark:text-slate-400">Minutes</label>
            <Input
              type="number"
              min={0}
              max={59}
              value={formData.minutes}
              onChange={(e) => updateField("minutes", +e.target.value || 0)}
              onKeyPress={handleKeyPress}
              className={`h-8 text-sm ${errors.duration ? "border-red-500" : ""}`}
            />
          </div>
          <div>
            <label className="text-xs text-slate-600 dark:text-slate-400">Seconds</label>
            <Input
              type="number"
              min={0}
              max={59}
              value={formData.seconds}
              onChange={(e) => updateField("seconds", +e.target.value || 0)}
              onKeyPress={handleKeyPress}
              className={`h-8 text-sm ${errors.duration ? "border-red-500" : ""}`}
            />
          </div>
        </div>
        {errors.duration && <p className="text-xs text-red-500 mt-1 animate-slide-down">{errors.duration}</p>}

        {timer.isActive && (
          <p className="text-xs text-amber-600 mt-1">
            ⚠️ Timer is currently active. Duration changes will apply on next start.
          </p>
        )}
      </div>

      {/* Timer Options */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="repeating"
            checked={formData.isRepeating}
            onCheckedChange={(checked: boolean) => updateField("isRepeating", checked)}
          />
          <Label htmlFor="repeating" className="text-sm">
            Repeat timer every
          </Label>
          {formData.isRepeating && (
            <div className="flex items-center space-x-1">
              <Input
                type="number"
                min={1}
                value={formData.repeatInterval}
                onChange={(e) => updateField("repeatInterval", +e.target.value || 300)}
                className={`h-6 w-16 text-xs ${errors.repeatInterval ? "border-red-500" : ""}`}
              />
              <span className="text-xs text-slate-500">seconds</span>
            </div>
          )}
        </div>
        {errors.repeatInterval && <p className="text-xs text-red-500 animate-slide-down">{errors.repeatInterval}</p>}

        <div className="flex items-center space-x-2">
          <Checkbox
            id="negative"
            checked={formData.isNegative}
            onCheckedChange={(checked: boolean) => updateField("isNegative", checked)}
          />
          <Label htmlFor="negative" className="text-sm">
            Continue counting after time up (negative timer)
          </Label>
        </div>
      </div>

      {/* Sound Selection */}
      <SoundSelector
        sounds={sounds}
        selectedSound={selectedSound}
        onSoundChange={setSelectedSound}
        isLoading={isLoadingSounds}
      />

      {/* Timer Customization */}
      <TimerCustomization
        primaryColor={formData.primaryColor}
        secondaryColor={formData.secondaryColor}
        fontFamily={formData.fontFamily}
        fontSize={formData.fontSize}
        onColorChange={(primary, secondary) => {
          updateField("primaryColor", primary)
          updateField("secondaryColor", secondary)
        }}
        onFontChange={(family, size) => {
          updateField("fontFamily", family)
          updateField("fontSize", size)
        }}
      />

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <Button onClick={handleSubmit} className="bg-orange-500 hover:bg-orange-600 text-white h-8 px-3 text-sm">
          Update Timer
        </Button>
        <Button onClick={onCancel} variant="outline" size="sm" className="h-8 px-3 text-sm">
          Cancel
        </Button>
      </div>
    </div>
  )
}
