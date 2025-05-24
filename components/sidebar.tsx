"use client"

import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { CheckSquare, Timer, Settings } from "lucide-react"

interface SidebarProps {
  currentView: "tasks" | "timers" | "settings"
  onViewChange: (view: "tasks" | "timers" | "settings") => void
}

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const menuItems = [
    { id: "tasks" as const, label: "Tasks", icon: CheckSquare },
    { id: "timers" as const, label: "Timers", icon: Timer },
    { id: "settings" as const, label: "Settings", icon: Settings },
  ]

  return (
    <div className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="KāryaYāna" className="w-10 h-10 rounded-lg" />
          <div>
            <h2 className="font-serif font-bold text-slate-800 dark:text-slate-100">KāryaYāna</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Vehicle of Action</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <Button
                key={item.id}
                variant={currentView === item.id ? "default" : "ghost"}
                className={`w-full justify-start ${
                  currentView === item.id
                    ? "bg-orange-500 hover:bg-orange-600 text-white"
                    : "hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
                onClick={() => onViewChange(item.id)}
              >
                <Icon className="mr-3 h-4 w-4" />
                {item.label}
              </Button>
            )
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500 dark:text-slate-400">Theme</span>
          <ThemeToggle />
        </div>
      </div>
    </div>
  )
}
