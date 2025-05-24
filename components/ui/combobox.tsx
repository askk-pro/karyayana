"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export interface ComboboxOption {
    value: string
    label: string
}

interface ComboboxProps {
    options: ComboboxOption[]
    value: string
    onValueChange: (value: string) => void
    placeholder?: string
    emptyMessage?: string
    disabled?: boolean
    className?: string
}

export function Combobox({
    options,
    value,
    onValueChange,
    placeholder = "Select an option",
    emptyMessage = "No results found.",
    disabled = false,
    className,
}: ComboboxProps) {
    const [open, setOpen] = React.useState(false)
    const [searchQuery, setSearchQuery] = React.useState("")

    // Filter options based on search query
    const filteredOptions = React.useMemo(() => {
        if (!searchQuery) return options

        return options.filter((option) => option.label.toLowerCase().includes(searchQuery.toLowerCase()))
    }, [options, searchQuery])

    // Find the selected option for display
    const selectedOption = React.useMemo(() => options.find((option) => option.value === value), [options, value])

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full justify-between", className)}
                    disabled={disabled}
                    onClick={() => setOpen(!open)}
                    type="button" // Prevent form submission when clicking
                >
                    {selectedOption ? selectedOption.label : placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                <Command shouldFilter={false}>
                    {" "}
                    {/* Disable built-in filtering as we're doing it manually */}
                    <CommandInput
                        placeholder={`Search ${placeholder.toLowerCase()}...`}
                        value={searchQuery}
                        onValueChange={setSearchQuery}
                    />
                    <CommandList>
                        <CommandEmpty>{emptyMessage}</CommandEmpty>
                        <CommandGroup className="max-h-[300px] overflow-y-auto">
                            {filteredOptions.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={option.value}
                                    onSelect={() => {
                                        onValueChange(option.value)
                                        setSearchQuery("")
                                        setOpen(false)
                                    }}
                                >
                                    <Check className={cn("mr-2 h-4 w-4", value === option.value ? "opacity-100" : "opacity-0")} />
                                    {option.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
