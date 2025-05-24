"use client"

import { Sidebar } from "@/components/sidebar"
import { SoundsManager } from "@/components/sounds-manager"
import { TaskManager } from "@/components/task-manager"
import { TimerPanel } from "@/components/timer-panel"
import { Button } from "@/components/ui/button"
import { Play } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export default function KaryayanaApp() {
  const [currentView, setCurrentView] = useState<"tasks" | "timers" | "sounds" | "settings">("tasks")
  const [showHero, setShowHero] = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { setTheme } = useTheme()

  // Keyboard shortcuts handler
  useEffect(() => {
    const handleShortcuts = (event: any, message: string) => {
      switch (message) {
        case "shortcut-new-task":
          setCurrentView("tasks")
          // Trigger new task dialog
          window.dispatchEvent(new CustomEvent("open-new-task-dialog"))
          break
        case "shortcut-new-timer":
          setCurrentView("timers")
          // Trigger new timer creation
          window.dispatchEvent(new CustomEvent("create-new-timer"))
          break
        case "shortcut-toggle-timer":
          // Toggle active timer
          window.dispatchEvent(new CustomEvent("toggle-active-timer"))
          break
        case "shortcut-toggle-sidebar":
          setSidebarCollapsed((prev) => !prev)
          break
        case "shortcut-toggle-theme":
          const currentTheme = document.documentElement.classList.contains("dark") ? "dark" : "light"
          setTheme(currentTheme === "dark" ? "light" : "dark")
          break
      }
    }

    // Listen for Electron IPC messages (only if available)
    const electronAPI = (window as any).electronAPI
    if (typeof window !== "undefined" && electronAPI) {
      electronAPI.on("shortcut-new-task", handleShortcuts)
      electronAPI.on("shortcut-new-timer", handleShortcuts)
      electronAPI.on("shortcut-toggle-timer", handleShortcuts)
      electronAPI.on("shortcut-toggle-sidebar", handleShortcuts)
      electronAPI.on("shortcut-toggle-theme", handleShortcuts)
    }

    return () => {
      if (typeof window !== "undefined" && electronAPI) {
        electronAPI.removeAllListeners("shortcut-new-task")
        electronAPI.removeAllListeners("shortcut-new-timer")
        electronAPI.removeAllListeners("shortcut-toggle-timer")
        electronAPI.removeAllListeners("shortcut-toggle-sidebar")
        electronAPI.removeAllListeners("shortcut-toggle-theme")
      }
    }
  }, [setTheme])

  if (showHero) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-8 transition-all duration-500">
        <div className="text-center max-w-2xl animate-fade-in">
          {/* Logo with Text */}
          <div className="mb-8 flex justify-center">
            <img
              src="/logo-with-text.png"
              alt="KāryaYāna Logo"
              className="max-w-full h-auto max-h-48 animate-float"
              style={{ maxWidth: "400px" }}
            />
          </div>

          {/* Tagline */}
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 font-light animate-slide-up">
            Your Daily Journey of Action
          </p>

          {/* Description */}
          <p className="text-lg text-slate-500 dark:text-slate-400 mb-12 leading-relaxed animate-slide-up-delay">
            Combine mindful task management with timer-based productivity. Move through your responsibilities with
            intention, rhythm, and clarity.
          </p>

          {/* Start Button */}
          <Button
            onClick={() => setShowHero(false)}
            size="lg"
            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 animate-bounce-subtle"
          >
            <Play className="mr-2 h-5 w-5" />
            Begin Your Journey
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex transition-all duration-300">
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <main className={`flex-1 p-4 transition-all duration-300 ${sidebarCollapsed ? "ml-0" : ""}`}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="KāryaYāna" className="w-10 h-10 rounded-lg" />
                <div>
                  <h1 className="text-2xl font-serif font-bold text-slate-800 dark:text-slate-100">KāryaYāna</h1>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {currentView === "tasks" && "Manage your daily actions"}
                    {currentView === "timers" && "Focus with mindful timing"}
                    {currentView === "sounds" && "Customize your audio experience"}
                    {currentView === "settings" && "Customize your journey"}
                  </p>
                </div>
              </div>

              {/* Keyboard shortcuts hint */}
              <div className="text-xs text-slate-400 dark:text-slate-500">
                <kbd className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded text-xs">Ctrl+N</kbd> New Task
                <span className="mx-2">•</span>
                <kbd className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded text-xs">Ctrl+T</kbd> New Timer
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="animate-fade-in">
            {currentView === "tasks" && <TaskManager />}
            {currentView === "timers" && <TimerPanel />}
            {currentView === "sounds" && <SoundsManager />}
            {currentView === "settings" && (
              <div className="text-center py-12">
                <p className="text-slate-500 dark:text-slate-400">Settings panel coming soon...</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
