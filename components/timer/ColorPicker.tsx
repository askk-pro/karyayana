"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Check, Palette } from "lucide-react"
import { useState } from "react"

interface ColorPickerProps {
  primaryColor: string
  secondaryColor: string
  onColorChange: (primary: string, secondary: string) => void
}

const colorPresets = [
  { name: "Orange", primary: "#f59e0b", secondary: "#fbbf24" },
  { name: "Blue", primary: "#3b82f6", secondary: "#60a5fa" },
  { name: "Green", primary: "#10b981", secondary: "#34d399" },
  { name: "Purple", primary: "#8b5cf6", secondary: "#a78bfa" },
  { name: "Red", primary: "#ef4444", secondary: "#f87171" },
  { name: "Pink", primary: "#ec4899", secondary: "#f472b6" },
]

const additionalColors = [
  "#f97316",
  "#eab308",
  "#84cc16",
  "#06b6d4",
  "#6366f1",
  "#a855f7",
  "#e11d48",
  "#dc2626",
  "#ea580c",
  "#ca8a04",
  "#65a30d",
  "#0891b2",
  "#4f46e5",
  "#9333ea",
  "#be185d",
  "#991b1b",
  "#c2410c",
  "#a16207",
  "#4d7c0f",
  "#0e7490",
  "#3730a3",
  "#7c2d12",
  "#9f1239",
  "#7f1d1d",
]

export function ColorPicker({ primaryColor, secondaryColor, onColorChange }: ColorPickerProps) {
  const [showCustom, setShowCustom] = useState(false)
  const [customPrimary, setCustomPrimary] = useState(primaryColor)
  const [customSecondary, setCustomSecondary] = useState(secondaryColor)

  const handlePresetClick = (preset: { primary: string; secondary: string }) => {
    onColorChange(preset.primary, preset.secondary)
  }

  const handleCustomColorApply = () => {
    onColorChange(customPrimary, customSecondary)
    setShowCustom(false)
  }

  const generateSecondaryColor = (primary: string) => {
    // Simple logic to generate a lighter version of the primary color
    const hex = primary.replace("#", "")
    const r = Number.parseInt(hex.substr(0, 2), 16)
    const g = Number.parseInt(hex.substr(2, 2), 16)
    const b = Number.parseInt(hex.substr(4, 2), 16)

    // Lighten by 20%
    const newR = Math.min(255, Math.floor(r + (255 - r) * 0.2))
    const newG = Math.min(255, Math.floor(g + (255 - g) * 0.2))
    const newB = Math.min(255, Math.floor(b + (255 - b) * 0.2))

    return `#${newR.toString(16).padStart(2, "0")}${newG.toString(16).padStart(2, "0")}${newB
      .toString(16)
      .padStart(2, "0")}`
  }

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Timer Colors</Label>

      {/* Preset Colors */}
      <div>
        <Label className="text-xs text-slate-600 dark:text-slate-400 mb-2 block">Preset Themes</Label>
        <div className="grid grid-cols-3 gap-2">
          {colorPresets.map((preset) => (
            <button
              key={preset.name}
              onClick={() => handlePresetClick(preset)}
              className={`flex items-center space-x-2 p-2 rounded border text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                primaryColor === preset.primary
                  ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                  : "border-slate-200 dark:border-slate-700"
              }`}
            >
              <div
                className="w-4 h-4 rounded-full border border-slate-300"
                style={{ backgroundColor: preset.primary }}
              />
              <span>{preset.name}</span>
              {primaryColor === preset.primary && <Check className="h-3 w-3 text-orange-500 ml-auto" />}
            </button>
          ))}
        </div>
      </div>

      {/* Additional Color Palette */}
      <div>
        <Label className="text-xs text-slate-600 dark:text-slate-400 mb-2 block">Color Palette</Label>
        <div className="grid grid-cols-6 gap-1">
          {additionalColors.map((color) => (
            <button
              key={color}
              onClick={() => onColorChange(color, generateSecondaryColor(color))}
              className={`w-8 h-8 rounded border-2 hover:scale-110 transition-transform ${
                primaryColor === color ? "border-slate-800 dark:border-slate-200" : "border-slate-300"
              }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>

      {/* Custom Color Picker */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-xs text-slate-600 dark:text-slate-400">Custom Colors</Label>
          <Button variant="ghost" size="sm" onClick={() => setShowCustom(!showCustom)} className="h-6 px-2 text-xs">
            <Palette className="h-3 w-3 mr-1" />
            {showCustom ? "Hide" : "Custom"}
          </Button>
        </div>

        {showCustom && (
          <div className="space-y-2 p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block">Primary</Label>
                <div className="flex gap-1">
                  <Input
                    type="color"
                    value={customPrimary}
                    onChange={(e) => setCustomPrimary(e.target.value)}
                    className="w-12 h-8 p-1 border rounded"
                  />
                  <Input
                    type="text"
                    value={customPrimary}
                    onChange={(e) => setCustomPrimary(e.target.value)}
                    className="flex-1 h-8 text-xs"
                    placeholder="#f59e0b"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block">Secondary</Label>
                <div className="flex gap-1">
                  <Input
                    type="color"
                    value={customSecondary}
                    onChange={(e) => setCustomSecondary(e.target.value)}
                    className="w-12 h-8 p-1 border rounded"
                  />
                  <Input
                    type="text"
                    value={customSecondary}
                    onChange={(e) => setCustomSecondary(e.target.value)}
                    className="flex-1 h-8 text-xs"
                    placeholder="#fbbf24"
                  />
                </div>
              </div>
            </div>
            <Button
              onClick={handleCustomColorApply}
              size="sm"
              className="w-full h-7 text-xs bg-orange-500 hover:bg-orange-600"
            >
              Apply Custom Colors
            </Button>
          </div>
        )}
      </div>

      {/* Preview */}
      <div className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800">
        <Label className="text-xs text-slate-600 dark:text-slate-400 mb-2 block">Preview</Label>
        <div className="flex items-center justify-center space-x-2">
          <div
            className="w-6 h-6 rounded border border-slate-300"
            style={{ backgroundColor: primaryColor }}
            title={`Primary: ${primaryColor}`}
          />
          <div
            className="w-6 h-6 rounded border border-slate-300"
            style={{ backgroundColor: secondaryColor }}
            title={`Secondary: ${secondaryColor}`}
          />
          <div className="text-lg font-bold px-2" style={{ color: primaryColor }}>
            25:00
          </div>
        </div>
      </div>
    </div>
  )
}
