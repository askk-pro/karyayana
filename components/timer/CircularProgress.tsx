"use client"

import type React from "react"

interface CircularProgressProps {
  progress: number
  size?: number
  strokeWidth?: number
  color?: string
  backgroundColor?: string
  children?: React.ReactNode
}

export function CircularProgress({
  progress,
  size = 120,
  strokeWidth = 8,
  color = "#f59e0b",
  backgroundColor = "#e5e7eb",
  children,
}: CircularProgressProps) {
  // Reduce stroke width by 30% as requested
  const adjustedStrokeWidth = strokeWidth * 0.7

  const radius = (size - adjustedStrokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={adjustedStrokeWidth}
          fill="transparent"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={adjustedStrokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-300 ease-in-out"
        />
      </svg>
      {/* Content in center */}
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  )
}
