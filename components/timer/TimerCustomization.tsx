"use client"

import { Label } from "@/components/ui/label"
import { ColorPicker } from "./ColorPicker"

interface TimerCustomizationProps {
  primaryColor: string
  secondaryColor: string
  fontFamily: string
  fontSize: string
  onColorChange: (primary: string, secondary: string) => void
  onFontChange: (family: string, size: string) => void
}

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
    <div className="space-y-4">
      <Label className="text-sm font-medium">Timer Appearance</Label>

      {/* Color Picker */}
      <ColorPicker primaryColor={primaryColor} secondaryColor={secondaryColor} onColorChange={onColorChange} />

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
    </div>
  )
}
