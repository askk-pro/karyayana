"use client"

import type React from "react"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

interface ChartDataset {
    data: number[]
    backgroundColor?: string[]
    borderColor?: string
}

interface ChartData {
    labels: string[]
    datasets: ChartDataset[]
}

interface ChartProps extends React.HTMLAttributes<HTMLDivElement> {
    data: ChartData
}


export function BarChart({ data, className, ...props }: ChartProps) {
    const chartRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        if (!chartRef.current) return

        // This is a placeholder for Chart.js
        // In a real implementation, you would use Chart.js or another charting library
        const ctx = chartRef.current.getContext("2d")
        if (!ctx) return

        // Clear canvas
        ctx.clearRect(0, 0, chartRef.current.width, chartRef.current.height)

        // Draw placeholder chart
        const width = chartRef.current.width
        const height = chartRef.current.height
        const barWidth = width / (data.labels.length * 2)
        const maxValue = Math.max(...data.datasets[0].data)

        // Draw bars
        data.labels.forEach((label: string, index: number) => {
            const value = data.datasets[0].data[index]
            const barHeight = (value / maxValue) * (height - 40)
            const x = index * (barWidth * 2) + barWidth / 2
            const y = height - barHeight - 20

            // Draw bar
            ctx.fillStyle = data.datasets[0].backgroundColor?.[index] ?? "#4f46e5"
            ctx.fillRect(x, y, barWidth, barHeight)

            // Draw label
            ctx.fillStyle = "#888"
            ctx.font = "10px Arial"
            ctx.textAlign = "center"
            ctx.fillText(label, x + barWidth / 2, height - 5)

            // Draw value
            ctx.fillStyle = "#333"
            ctx.fillText(value.toString(), x + barWidth / 2, y - 5)
        })
    }, [data])

    return (
        <div className={cn("w-full", className)} {...props}>
            <canvas ref={chartRef} width={500} height={300} />
        </div>
    )
}

export function LineChart({ data, className, ...props }: ChartProps) {
    const chartRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        if (!chartRef.current) return

        // This is a placeholder for Chart.js
        // In a real implementation, you would use Chart.js or another charting library
        const ctx = chartRef.current.getContext("2d")
        if (!ctx) return

        // Clear canvas
        ctx.clearRect(0, 0, chartRef.current.width, chartRef.current.height)

        // Draw placeholder chart
        const width = chartRef.current.width
        const height = chartRef.current.height
        const dataPoints = data.datasets[0].data
        const maxValue = Math.max(...dataPoints)
        const minValue = Math.min(...dataPoints)
        const range = maxValue - minValue
        const pointSpacing = width / (dataPoints.length - 1)

        // Draw line
        ctx.beginPath()
        ctx.strokeStyle = data.datasets[0].borderColor || "#4f46e5"
        ctx.lineWidth = 2

        dataPoints.forEach((value: number, index: number) => {
            const x = index * pointSpacing
            const y = height - ((value - minValue) / range) * (height - 40) - 20

            if (index === 0) {
                ctx.moveTo(x, y)
            } else {
                ctx.lineTo(x, y)
            }

            // Draw point
            ctx.fillStyle = data.datasets[0].borderColor || "#4f46e5"
            ctx.beginPath()
            ctx.arc(x, y, 4, 0, Math.PI * 2)
            ctx.fill()

            // Draw label
            ctx.fillStyle = "#888"
            ctx.font = "10px Arial"
            ctx.textAlign = "center"
            ctx.fillText(data.labels[index], x, height - 5)

            // Draw value
            ctx.fillStyle = "#333"
            ctx.fillText(value.toString(), x, y - 10)
        })

        ctx.stroke()
    }, [data])

    return (
        <div className={cn("w-full", className)} {...props}>
            <canvas ref={chartRef} width={500} height={300} />
        </div>
    )
}
