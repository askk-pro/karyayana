"use client"

import { Label } from "@/components/ui/label"

interface TimerCustomizationProps {
  primaryColor: string
  secondaryColor: string
  fontFamily: string
  fontSize: string
  onColorChange: (primary: string, secondary: string) => void
  onFontChange: (family: string, size: string) => void
}

const colorPresets = [
  { name: "Orange", primary: "#f59e0b", secondary: "#fbbf24" },
  { name: "Blue", primary: "#3b82f6", secondary: "#60a5fa" },
  { name: "Green", primary: "#10b981", secondary: "#34d399" },
  { name: "Purple", primary: "#8b5cf6", secondary: "#a78bfa" },
  { name: "Red", primary: "#ef4444", secondary: "#f87171" },
  { name: "Pink", primary: "#ec4899", secondary: "#f472b6" },
]

const fontOptions = [
  { name: "Monospace", value: "mono" },
  { name: "Sans Serif", value: "sans" },
  { name: "Serif", value: "serif" },
]

const sizeOptions = [
  { name: "Small", value: "text-lg" },
  { name: "Medium", value: "text-2xl" },
  { name: "Large", value: "text-3xl" },
  { name: "Extra Large", value: "text-4xl" },
]

export function TimerCustomization({
  primaryColor,
  secondaryColor,
  fontFamily,
  fontSize,
  onColorChange,
  onFontChange,
}: TimerCustomizationProps) {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Timer Appearance</Label>

      {/* Color Presets */}
      <div>
        <Label className="text-xs text-slate-600 dark:text-slate-400 mb-2 block">Color Theme</Label>
        <div className="grid grid-cols-3 gap-2">
          {colorPresets.map((preset) => (
            <button
              key={preset.name}
              onClick={() => onColorChange(preset.primary, preset.secondary)}
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
            </button>
          ))}
        </div>
      </div>

      {/* Font Options */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block">Font</Label>
          <select
            value={fontFamily}
            onChange={(e) => onFontChange(e.target.value, fontSize)}
            className="w-full h-8 px-2 text-xs border border-input bg-background rounded-md"
          >
            {fontOptions.map((font) => (
              <option key={font.value} value={font.value}>
                {font.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block">Size</Label>
          <select
            value={fontSize}
            onChange={(e) => onFontChange(fontFamily, e.target.value)}
            className="w-full h-8 px-2 text-xs border border-input bg-background rounded-md"
          >
            {sizeOptions.map((size) => (
              <option key={size.value} value={size.value}>
                {size.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Preview */}
      <div className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800">
        <Label className="text-xs text-slate-600 dark:text-slate-400 mb-2 block">Preview</Label>
        <div className="flex justify-center">
          <div
            className={`${fontSize} font-bold`}
            style={{
              color: primaryColor,
              fontFamily: fontFamily === "mono" ? "monospace" : fontFamily === "serif" ? "serif" : "sans-serif",
            }}
          >
            25:00
          </div>
        </div>
      </div>
    </div>
  )
}
