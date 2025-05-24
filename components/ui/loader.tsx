"use client"

import type React from "react"
import { cn } from "@/lib/utils"

interface LoaderProps extends React.SVGProps<SVGSVGElement> {
    size?: number
    className?: string
}

export function Loader({ size = 24, className, ...props }: LoaderProps) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn("animate-spin", className)}
            {...props}
        >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
    )
}

export function MedicalLoader({ size = 40, className, ...props }: LoaderProps) {
    return (
        <div className="flex items-center justify-center">
            <svg width={size} height={size} viewBox="0 0 100 100" className={cn("animate-spin", className)} {...props}>
                <defs>
                    <linearGradient id="medical-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#14b8a6" />
                    </linearGradient>
                </defs>
                <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="url(#medical-gradient)"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray="180 250"
                />
                <g transform="translate(50, 50)">
                    <rect x="-15" y="-3" width="30" height="6" rx="2" fill="url(#medical-gradient)" />
                    <rect x="-3" y="-15" width="6" height="30" rx="2" fill="url(#medical-gradient)" />
                </g>
            </svg>
        </div>
    )
}