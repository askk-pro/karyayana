"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle, Check } from "lucide-react"
import { useState } from "react"

interface CustomSound {
  id: string
  name: string
  url: string
}

interface JsonTimerEditorProps {
  onCreateTimer: (timer: any) => void
  onCancel: () => void
  sounds: CustomSound[]
}

export function JsonTimerEditor({ onCreateTimer, onCancel, sounds }: JsonTimerEditorProps) {
  const defaultTimerJson = {
    id: Date.now().toString(),
    taskName: "Focus Session",
    hours: 0,
    minutes: 25,
    seconds: 0,
    totalSeconds: 1500,
    remaining: 1500,
    isActive: false,
    isPaused: false,
    soundUrl: sounds.length > 0 ? sounds[0].url : "",
    soundName: sounds.length > 0 ? sounds[0].name : "No sound",
    soundId: sounds.length > 0 ? sounds[0].id : "",
    isRepeating: false,
    repeatInterval: 300,
    isNegative: false,
    isMuted: false,
    primaryColor: "#f59e0b",
    secondaryColor: "#fbbf24",
    fontFamily: "mono",
    fontSize: "text-2xl",
  }

  const [jsonValue, setJsonValue] = useState(JSON.stringify(defaultTimerJson, null, 2))
  const [error, setError] = useState<string | null>(null)
  const [isValid, setIsValid] = useState(true)

  const validateJson = (value: string) => {
    try {
      const parsed = JSON.parse(value)

      // Validate required fields
      const requiredFields = ["taskName", "hours", "minutes", "seconds", "totalSeconds", "remaining"]
      const missingFields = requiredFields.filter((field) => !(field in parsed))

      if (missingFields.length > 0) {
        setError(`Missing required fields: ${missingFields.join(", ")}`)
        setIsValid(false)
        return false
      }

      // Validate data types
      if (typeof parsed.taskName !== "string") {
        setError("taskName must be a string")
        setIsValid(false)
        return false
      }

      if (!Number.isInteger(parsed.hours) || parsed.hours < 0) {
        setError("hours must be a non-negative integer")
        setIsValid(false)
        return false
      }

      if (!Number.isInteger(parsed.minutes) || parsed.minutes < 0 || parsed.minutes > 59) {
        setError("minutes must be an integer between 0 and 59")
        setIsValid(false)
        return false
      }

      if (!Number.isInteger(parsed.seconds) || parsed.seconds < 0 || parsed.seconds > 59) {
        setError("seconds must be an integer between 0 and 59")
        setIsValid(false)
        return false
      }

      // Calculate and validate totalSeconds
      const calculatedTotal = parsed.hours * 3600 + parsed.minutes * 60 + parsed.seconds
      if (parsed.totalSeconds !== calculatedTotal) {
        setError(`totalSeconds (${parsed.totalSeconds}) doesn't match calculated value (${calculatedTotal})`)
        setIsValid(false)
        return false
      }

      if (calculatedTotal === 0) {
        setError("Timer duration must be greater than 0")
        setIsValid(false)
        return false
      }

      setError(null)
      setIsValid(true)
      return true
    } catch (e) {
      setError("Invalid JSON syntax")
      setIsValid(false)
      return false
    }
  }

  const handleJsonChange = (value: string) => {
    setJsonValue(value)
    validateJson(value)
  }

  const handleCreate = () => {
    if (validateJson(jsonValue)) {
      try {
        const timerData = JSON.parse(jsonValue)
        // Ensure ID is unique
        timerData.id = Date.now().toString()
        onCreateTimer(timerData)
      } catch (e) {
        setError("Failed to parse JSON")
      }
    }
  }

  const getLineNumbers = () => {
    const lines = jsonValue.split("\n")
    return lines.map((_, index) => index + 1).join("\n")
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-slate-600 dark:text-slate-400">
        <p>Create a timer by editing the JSON below. All fields are customizable.</p>
        <p className="mt-1">
          <strong>Available sounds:</strong> {sounds.length > 0 ? sounds.map((s) => s.name).join(", ") : "None"}
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isValid && !error && (
        <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
          <Check className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            JSON is valid and ready to create timer
          </AlertDescription>
        </Alert>
      )}

      <div className="relative">
        <div className="flex border rounded-md overflow-hidden">
          {/* Line numbers */}
          <div className="bg-slate-50 dark:bg-slate-800 px-2 py-3 text-xs text-slate-500 font-mono select-none border-r">
            <pre>{getLineNumbers()}</pre>
          </div>

          {/* Code editor */}
          <div className="flex-1">
            <textarea
              value={jsonValue}
              onChange={(e) => handleJsonChange(e.target.value)}
              className="w-full h-96 p-3 font-mono text-sm border-0 resize-none focus:outline-none focus:ring-0 bg-white dark:bg-slate-900"
              placeholder="Enter timer JSON..."
              spellCheck={false}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button
          onClick={handleCreate}
          disabled={!isValid}
          className="bg-orange-500 hover:bg-orange-600 text-white"
          title="Create timer from JSON"
        >
          Create Timer
        </Button>
        <Button onClick={onCancel} variant="outline" title="Cancel and close editor">
          Cancel
        </Button>
      </div>

      <div className="text-xs text-slate-500 space-y-1">
        <p>
          <strong>Timer Schema Reference:</strong>
        </p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>
            <code>taskName</code>: string - Name of the timer
          </li>
          <li>
            <code>hours, minutes, seconds</code>: integers - Timer duration
          </li>
          <li>
            <code>totalSeconds, remaining</code>: integers - Calculated from duration
          </li>
          <li>
            <code>isRepeating</code>: boolean - Whether timer repeats
          </li>
          <li>
            <code>repeatInterval</code>: integer - Seconds between repeats
          </li>
          <li>
            <code>isNegative</code>: boolean - Continue counting after time up
          </li>
          <li>
            <code>primaryColor, secondaryColor</code>: hex colors - Timer theme
          </li>
          <li>
            <code>fontFamily</code>: {'"mono" | "sans" | "serif"'} - Display font
          </li>
          <li>
            <code>fontSize</code>: {'"text-sm" | "text-base" | "text-lg" | "text-xl" | "text-2xl"'} - Display size
          </li>
        </ul>
      </div>
    </div>
  )
}
