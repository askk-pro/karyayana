"use client"

import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { CheckSquare, Timer, Settings, Music, ChevronLeft, ChevronRight } from "lucide-react"

interface SidebarProps {
  currentView: "tasks" | "timers" | "sounds" | "settings"
  onViewChange: (view: "tasks" | "timers" | "sounds" | "settings") => void
  collapsed: boolean
  onToggleCollapse: () => void
}

export function Sidebar({ currentView, onViewChange, collapsed, onToggleCollapse }: SidebarProps) {
  const menuItems = [
    { id: "tasks" as const, label: "Tasks", icon: CheckSquare },
    { id: "timers" as const, label: "Timers", icon: Timer },
    { id: "sounds" as const, label: "Sounds", icon: Music },
    { id: "settings" as const, label: "Settings", icon: Settings },
  ]

  return (
    <div
      className={`${collapsed ? "w-16" : "w-64"} bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col transition-all duration-300 relative`}
    >
      {/* Collapse Toggle */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggleCollapse}
        className="absolute -right-3 top-6 z-10 h-6 w-6 rounded-full border bg-white dark:bg-slate-800 shadow-md hover:shadow-lg transition-all duration-200"
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </Button>

      {/* Logo Section */}
      <div
        className={`${collapsed ? "p-3" : "p-6"} border-b border-slate-200 dark:border-slate-700 transition-all duration-300`}
      >
        {collapsed ? (
          <div className="flex justify-center">
            <img src="/logo.png" alt="KāryaYāna" className="w-8 h-8 rounded-lg" />
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="KāryaYāna" className="w-8 h-8 rounded-lg" />
            <div>
              <h2 className="font-serif font-bold text-slate-800 dark:text-slate-100 text-sm">KāryaYāna</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Vehicle of Action</p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <Button
                key={item.id}
                variant={currentView === item.id ? "default" : "ghost"}
                size="sm"
                className={`w-full ${collapsed ? "justify-center px-0" : "justify-start"} h-8 ${currentView === item.id
                    ? "bg-orange-500 hover:bg-orange-600 text-white"
                    : "hover:bg-slate-100 dark:hover:bg-slate-700"
                  } transition-all duration-200`}
                onClick={() => onViewChange(item.id)}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`h-4 w-4 ${collapsed ? "" : "mr-2"}`} />
                {!collapsed && <span className="text-sm">{item.label}</span>}
              </Button>
            )
          })}
        </div>
      </nav>

      {/* Footer */}
      <div
        className={`${collapsed ? "p-3" : "p-4"} border-t border-slate-200 dark:border-slate-700 transition-all duration-300`}
      >
        {collapsed ? (
          <div className="flex justify-center">
            <ThemeToggle />
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">Theme</span>
            <ThemeToggle />
          </div>
        )}
      </div>
    </div>
  )
}
