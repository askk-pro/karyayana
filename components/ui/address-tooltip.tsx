"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { MapPin } from "lucide-react"
import type { Property } from "@/lib/types"

interface AddressTooltipProps {
    property: Property
    children: React.ReactNode
}

export function AddressTooltip({ property, children }: AddressTooltipProps) {
    const [showTooltip, setShowTooltip] = useState(false)
    const tooltipRef = useRef<HTMLDivElement>(null)
    const triggerRef = useRef<HTMLDivElement>(null)
    const [tooltipPosition, setTooltipPosition] = useState<"top" | "bottom">("top")
    const [position, setPosition] = useState({ top: 0, left: 0 })

    // Format the address for the tooltip
    const formatAddress = () => {
        if (!property.building?.addresses) {
            return "No address information available"
        }

        const building = property.building
        const buildingAddress = building.addresses

        if (!buildingAddress) {
            return "No address information available"
        }

        const address = Array.isArray(buildingAddress) ? buildingAddress[0] : buildingAddress

        const parts = []

        // Add door number if available
        if (building.door_no) {
            parts.push(`Door: ${building.door_no}`)
        }

        // Add street address
        if (address.street_address) {
            parts.push(address.street_address)
        }

        // Add area, location, postal code
        if (address.areas) {
            const area = address.areas

            if (area.name) {
                parts.push(area.name)
            }

            // Safely access postal_code
            if ("postal_code" in area && area.postal_code) {
                parts.push(`Postal: ${area.postal_code}`)
            }

            if (area.locations) {
                const location = area.locations

                if (location.name) {
                    parts.push(location.name)
                }

                if (location.states) {
                    const state = location.states

                    if (state) {
                        // Format state and country together with comma
                        const stateCountry = []
                        if (state.name) stateCountry.push(state.name)
                        if (state.country) stateCountry.push(state.country)

                        if (stateCountry.length > 0) {
                            parts.push(stateCountry.join(", "))
                        }
                    }
                }
            }
        }

        if (parts.length === 0) {
            return "No address information available"
        }

        return parts.join(" • ")
    }

    // Calculate tooltip position
    useEffect(() => {
        if (showTooltip && tooltipRef.current && triggerRef.current) {
            const triggerRect = triggerRef.current.getBoundingClientRect()
            const tooltipRect = tooltipRef.current.getBoundingClientRect()

            // Check if there's enough space above
            const spaceAbove = triggerRect.top
            const spaceBelow = window.innerHeight - triggerRect.bottom

            // Determine if tooltip should be above or below
            const preferredPosition = spaceAbove > tooltipRect.height + 10 ? "top" : "bottom"
            setTooltipPosition(preferredPosition)

            // Calculate left position (centered)
            let left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2

            // Ensure tooltip doesn't go off screen horizontally
            if (left < 10) left = 10
            if (left + tooltipRect.width > window.innerWidth - 10) {
                left = window.innerWidth - tooltipRect.width - 10
            }

            // Calculate top position based on preferred position
            let top
            if (preferredPosition === "top") {
                top = triggerRect.top - tooltipRect.height - 10
            } else {
                top = triggerRect.bottom + 10
            }

            setPosition({ top, left })
        }
    }, [showTooltip])

    return (
        <div
            ref={triggerRef}
            className="relative inline-block"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            {children}

            {showTooltip && (
                <div
                    ref={tooltipRef}
                    className="fixed z-50 p-3 rounded-lg shadow-lg text-white text-sm min-w-[200px] max-w-[300px]"
                    style={{
                        top: `${position.top}px`,
                        left: `${position.left}px`,
                        background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                    }}
                >
                    <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <div>{formatAddress()}</div>
                    </div>
                    <div
                        className="absolute w-3 h-3 rotate-45"
                        style={{
                            background: "#8b5cf6",
                            ...(tooltipPosition === "top"
                                ? { bottom: "-6px", left: "calc(50% - 6px)" }
                                : { top: "-6px", left: "calc(50% - 6px)" }),
                        }}
                    />
                </div>
            )}
        </div>
    )
}
