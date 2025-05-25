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

interface TimerFormData {
  taskName: string
  hours: number
  minutes: number
  seconds: number
  isRepeating: boolean
  repeatInterval: number
  isNegative: boolean
  primaryColor: string
  secondaryColor: string
  fontFamily: string
  fontSize: string
}

interface TimerFormProps {
  onCreateTimer: (data: TimerFormData & { soundUrl: string; soundName: string; soundId: string }) => void
  onCancel: () => void
  sounds: CustomSound[]
  isLoadingSounds: boolean
}

export function TimerForm({ onCreateTimer, onCancel, sounds, isLoadingSounds }: TimerFormProps) {
  const [formData, setFormData] = useState<TimerFormData>({
    taskName: "",
    hours: 0,
    minutes: 0, // Changed from 25 to 0
    seconds: 30, // Changed from 0 to 30
    isRepeating: false,
    repeatInterval: 300, // 5 minutes default in seconds
    isNegative: false,
    primaryColor: "#f59e0b",
    secondaryColor: "#fbbf24",
    fontFamily: "mono",
    fontSize: "text-2xl",
  })
  const [selectedSound, setSelectedSound] = useState<CustomSound | null>(sounds.length > 0 ? sounds[0] : null)
  const [errors, setErrors] = useState<{ taskName?: string; duration?: string; repeatInterval?: string }>({})

  const taskNameRef = useRef<HTMLInputElement>(null)

  // Auto-focus on task name input when form opens
  useEffect(() => {
    if (taskNameRef.current) {
      taskNameRef.current.focus()
    }
  }, [])

  // Update selected sound when sounds change
  useEffect(() => {
    if (sounds.length > 0 && !selectedSound) {
      setSelectedSound(sounds[0])
    }
  }, [sounds, selectedSound])

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
      // Focus on the first field with an error
      if (errors.taskName && taskNameRef.current) {
        taskNameRef.current.focus()
      }
      return
    }

    onCreateTimer({
      ...formData,
      soundUrl: selectedSound?.url || "",
      soundName: selectedSound?.name || "No sound",
      soundId: selectedSound?.id || "",
    })

    // Close the form after successful creation
    onCancel()

    // Reset form
    setFormData({
      taskName: "",
      hours: 0,
      minutes: 0,
      seconds: 30,
      isRepeating: false,
      repeatInterval: 300,
      isNegative: false,
      primaryColor: "#f59e0b",
      secondaryColor: "#fbbf24",
      fontFamily: "mono",
      fontSize: "text-2xl",
    })
    setErrors({})
  }

  const updateField = (field: keyof TimerFormData, value: string | number | boolean) => {
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

        <div className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-800 p-2 rounded">
          💡 <strong>Tip:</strong> Repeating timers restart automatically. Negative timers count into overtime. Only one
          option can be active at a time.
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
        <Button onClick={handleSubmit} className="flex-1 bg-orange-500 hover:bg-orange-600">
          Create Timer
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
