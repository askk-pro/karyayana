"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { DraggableSoundGrid } from "./sounds/DraggableSoundGrid"
import { SoundEditModal } from "./sounds/SoundEditModal"
import { SoundUploadModal } from "./sounds/SoundUploadModal"

interface Sound {
  id: string
  name: string
  filename: string
  filepath: string
  url: string
  duration?: number
  volume?: number
  start_time?: number
  end_time?: number
  primary_color?: string
  secondary_color?: string
  created_at: string
  display_order?: number
}

export function SoundsManager() {
  const [sounds, setSounds] = useState<Sound[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [editingSound, setEditingSound] = useState<Sound | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load sounds from database on mount
  useEffect(() => {
    loadSounds()
  }, [])

  const loadSounds = async () => {
    if (window.electronAPI) {
      try {
        const soundsData = await window.electronAPI.getSounds()
        setSounds(soundsData)

        // Update localStorage for timer panel compatibility
        const soundsForStorage = soundsData.map((sound: Sound) => ({
          id: sound.id,
          name: sound.name,
          url: sound.url,
          primary_color: sound.primary_color,
          secondary_color: sound.secondary_color,
        }))
        localStorage.setItem("karyayana-sounds", JSON.stringify(soundsForStorage))

        // Dispatch event to notify other components
        window.dispatchEvent(new CustomEvent("sounds-updated"))
      } catch (error) {
        console.error("Error loading sounds:", error)
      }
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files[0] && files[0].type.startsWith("audio/")) {
      setUploadFile(files[0])
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleUploadConfirm = async (data: {
    name: string
    startTime: number
    endTime: number
    volume: number
    primaryColor: string
    secondaryColor: string
  }) => {
    if (!uploadFile || !window.electronAPI) return

    setUploading(true)
    try {
      const buffer = Buffer.from(await uploadFile.arrayBuffer())

      await window.electronAPI.uploadSound({
        name: data.name,
        buffer,
        originalName: uploadFile.name,
        startTime: data.startTime,
        endTime: data.endTime,
        volume: data.volume,
        primaryColor: data.primaryColor,
        secondaryColor: data.secondaryColor,
      })

      await loadSounds()
      setUploadFile(null)
    } catch (error) {
      console.error("Error uploading sound:", error)
    } finally {
      setUploading(false)
    }
  }

  const handleEditSave = async (data: {
    id: string
    name: string
    volume: number
    start_time: number
    end_time: number
    primary_color: string
    secondary_color: string
  }) => {
    if (!window.electronAPI) return

    try {
      await window.electronAPI.updateSound(data)
      await loadSounds()
      setEditingSound(null)
    } catch (error) {
      console.error("Error updating sound:", error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.electronAPI) return

    try {
      await window.electronAPI.deleteSound(id)
      await loadSounds()
    } catch (error) {
      console.error("Error deleting sound:", error)
    }
  }

  const handleRename = async (id: string, newName: string) => {
    if (!window.electronAPI) return

    try {
      await window.electronAPI.updateSound({ id, name: newName })
      await loadSounds()
    } catch (error) {
      console.error("Error renaming sound:", error)
    }
  }

  const handleReorder = async (newSounds: Sound[]) => {
    // Update local state immediately
    setSounds(newSounds)

    // Save order to database
    if (window.electronAPI) {
      try {
        const soundOrders = newSounds.map((sound, index) => ({
          id: sound.id,
          order: index,
        }))
        await window.electronAPI.updateSoundOrder(soundOrders)
        await loadSounds() // Refresh to ensure consistency
      } catch (error) {
        console.error("Error updating sound order:", error)
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif">Upload Custom Sounds</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center hover:border-orange-400 transition-colors">
            <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">Upload Audio Files</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Upload, trim, and customize your audio files with volume and color settings
            </p>
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {uploading ? "Uploading..." : "Choose Files"}
            </Button>
            <input ref={fileInputRef} type="file" accept="audio/*" onChange={handleFileSelect} className="hidden" />
            <p className="text-xs text-slate-400 mt-2">Supports MP3, WAV, OGG, and other audio formats</p>
          </div>
        </CardContent>
      </Card>

      {/* Sounds Library */}
      {sounds.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Your Sound Library ({sounds.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <DraggableSoundGrid
              sounds={sounds}
              onEdit={(sound) => setEditingSound(sound)}
              onDelete={handleDelete}
              onRename={handleRename}
              onReorder={(newSounds) => handleReorder(newSounds)}
            />
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {sounds.length === 0 && !uploading && (
        <div className="text-center py-12 animate-fade-in">
          <div className="text-6xl mb-4">🎵</div>
          <h3 className="text-xl font-serif font-medium text-slate-700 dark:text-slate-300 mb-2">Upload Your Sounds</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            Add your own meditation bells, nature sounds, or focus music with custom trimming, volume, and color coding.
          </p>
          <p className="text-sm text-slate-400">Sounds are stored securely and automatically sync with your timers.</p>
        </div>
      )}

      {/* Upload Modal */}
      <SoundUploadModal
        file={uploadFile}
        open={!!uploadFile}
        onClose={() => setUploadFile(null)}
        onConfirm={handleUploadConfirm}
      />

      {/* Edit Modal */}
      <SoundEditModal
        sound={editingSound}
        open={!!editingSound}
        onClose={() => setEditingSound(null)}
        onSave={handleEditSave}
      />
    </div>
  )
}
