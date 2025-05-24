"use client"

import * as React from "react"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Command, CommandGroup, CommandItem } from "@/components/ui/command"
import { Command as CommandPrimitive } from "cmdk"

export interface MultiSelectProps {
    value: string[]
    onValueChange: (value: string[]) => void
    placeholder?: string
    children: React.ReactNode
}

export function MultiSelect({ value, onValueChange, placeholder = "Select items", children }: MultiSelectProps) {
    const inputRef = React.useRef<HTMLInputElement>(null)
    const [open, setOpen] = React.useState(false)
    const [inputValue, setInputValue] = React.useState("")

    const handleUnselect = (item: string) => {
        onValueChange(value.filter((i) => i !== item))
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        const input = inputRef.current
        if (input) {
            if (e.key === "Delete" || e.key === "Backspace") {
                if (input.value === "" && value.length > 0) {
                    onValueChange(value.slice(0, -1))
                }
            }
            if (e.key === "Escape") {
                input.blur()
            }
        }
    }

    return (
        <Command onKeyDown={handleKeyDown} className="overflow-visible bg-transparent">
            <div className="group border border-input px-3 py-2 text-sm ring-offset-background rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                <div className="flex gap-1 flex-wrap">
                    {value.map((item) => (
                        <Badge key={item} variant="secondary" className="mb-1">
                            {item}
                            <button
                                className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        handleUnselect(item)
                                    }
                                }}
                                onMouseDown={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                }}
                                onClick={() => handleUnselect(item)}
                            >
                                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                            </button>
                        </Badge>
                    ))}
                    <CommandPrimitive.Input
                        ref={inputRef}
                        value={inputValue}
                        onValueChange={setInputValue}
                        onBlur={() => setOpen(false)}
                        onFocus={() => setOpen(true)}
                        placeholder={value.length === 0 ? placeholder : undefined}
                        className="ml-2 bg-transparent outline-none placeholder:text-muted-foreground flex-1"
                    />
                </div>
            </div>
            <div className="relative mt-2">
                {open && (
                    <div className="absolute w-full z-[100] top-0 rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in max-h-[300px] overflow-y-auto">
                        <CommandGroup className="h-full overflow-auto">
                            {React.Children.map(children, (child) => {
                                if (React.isValidElement(child)) {
                                    return React.cloneElement(child as React.ReactElement<MultiSelectItemProps>, {
                                        onSelect: (selectedValue: string) => {
                                            setInputValue("")
                                            if (!value.includes(selectedValue)) {
                                                onValueChange([...value, selectedValue])
                                            }
                                        },
                                        className: value.includes((child as React.ReactElement<MultiSelectItemProps>).props.value)
                                            ? "bg-accent text-accent-foreground"
                                            : undefined,
                                    })
                                }
                                return child
                            })}
                        </CommandGroup>
                    </div>
                )}
            </div>
        </Command>
    )
}

export interface MultiSelectItemProps {
    value: string
    children: React.ReactNode
    className?: string
    onSelect?: (value: string) => void
}

export function MultiSelectItem({ value, children, className, onSelect }: MultiSelectItemProps) {
    return (
        <CommandItem value={value} onSelect={onSelect ? () => onSelect(value) : undefined} className={className}>
            {children}
        </CommandItem>
    )
}
