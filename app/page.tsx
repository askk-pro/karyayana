"use client"

import { useState } from "react"
import { TaskManager } from "@/components/task-manager"
import { TimerPanel } from "@/components/timer-panel"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Play } from "lucide-react"

export default function KaryayanaApp() {
  const [currentView, setCurrentView] = useState<"tasks" | "timers" | "settings">("tasks")
  const [showHero, setShowHero] = useState(true)

  if (showHero) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-8">
        <div className="text-center max-w-2xl">
          {/* Logo with Text */}
          <div className="mb-8 flex justify-center">
            <img
              src="/logo-with-text.png"
              alt="KāryaYāna Logo"
              className="max-w-full h-auto max-h-48"
              style={{ maxWidth: "400px" }}
            />
          </div>

          {/* Tagline */}
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 font-light">Your Daily Journey of Action</p>

          {/* Description */}
          <p className="text-lg text-slate-500 dark:text-slate-400 mb-12 leading-relaxed">
            Combine mindful task management with timer-based productivity. Move through your responsibilities with
            intention, rhythm, and clarity.
          </p>

          {/* Start Button */}
          <Button
            onClick={() => setShowHero(false)}
            size="lg"
            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Play className="mr-2 h-5 w-5" />
            Begin Your Journey
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />

      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img src="/logo.png" alt="KāryaYāna" className="w-12 h-12 rounded-lg" />
                <div>
                  <h1 className="text-3xl font-serif font-bold text-slate-800 dark:text-slate-100">KāryaYāna</h1>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">
                    {currentView === "tasks" && "Manage your daily actions"}
                    {currentView === "timers" && "Focus with mindful timing"}
                    {currentView === "settings" && "Customize your journey"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          {currentView === "tasks" && <TaskManager />}
          {currentView === "timers" && <TimerPanel />}
          {currentView === "settings" && (
            <div className="text-center py-12">
              <p className="text-slate-500 dark:text-slate-400">Settings panel coming soon...</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
