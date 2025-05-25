const { ipcMain } = require("electron")
const fs = require("fs")
const path = require("path")
const { cancelTimerNotification } = require("./timer-monitor")

function setupIpcHandlers(db, soundsPath, isDev) {
  // Get current system timestamp
  ipcMain.handle("get-current-timestamp", () => {
    return Date.now()
  })

  // Cancel timer notification and audio
  ipcMain.handle("cancel-timer-notification", (event, timerId) => {
    return cancelTimerNotification(timerId)
  })

  // Sound management
  setupSoundHandlers(db, soundsPath, isDev)

  // Timer management
  setupTimerHandlers(db)

  // App settings
  setupSettingsHandlers(db)

  // Task management
  setupTaskHandlers(db)
}

function setupSoundHandlers(db, soundsPath, isDev) {
  ipcMain.handle("upload-sound", async (event, { name, buffer, originalName }) => {
    try {
      const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
      const ext = path.extname(originalName)
      const filename = `${id}${ext}`
      const filepath = path.join(soundsPath, filename)

      // Write file to sounds directory
      fs.writeFileSync(filepath, buffer)

      // Save to database
      const stmt = db.prepare(`
        INSERT INTO sounds (id, name, filename, filepath)
        VALUES (?, ?, ?, ?)
      `)

      stmt.run(id, name, filename, filepath)

      return {
        id,
        name,
        filename,
        filepath,
        url: isDev ? `http://localhost:3000/sounds/${filename}` : `file://${filepath}`,
      }
    } catch (error) {
      console.error("Error uploading sound:", error)
      throw error
    }
  })

  ipcMain.handle("get-sounds", async () => {
    try {
      const stmt = db.prepare("SELECT * FROM sounds ORDER BY created_at DESC")
      const sounds = stmt.all()

      return sounds.map((sound) => ({
        ...sound,
        url: isDev ? `http://localhost:3000/sounds/${sound.filename}` : `file://${sound.filepath}`,
      }))
    } catch (error) {
      console.error("Error getting sounds:", error)
      return []
    }
  })

  ipcMain.handle("delete-sound", async (event, id) => {
    try {
      // Get sound info
      const sound = db.prepare("SELECT * FROM sounds WHERE id = ?").get(id)

      if (sound) {
        // Delete file
        if (fs.existsSync(sound.filepath)) {
          fs.unlinkSync(sound.filepath)
        }

        // Delete from database
        db.prepare("DELETE FROM sounds WHERE id = ?").run(id)
      }

      return true
    } catch (error) {
      console.error("Error deleting sound:", error)
      throw error
    }
  })

  ipcMain.handle("update-sound-duration", async (event, { id, duration }) => {
    try {
      db.prepare("UPDATE sounds SET duration = ? WHERE id = ?").run(duration, id)
      return true
    } catch (error) {
      console.error("Error updating sound duration:", error)
      throw error
    }
  })
}

function setupTimerHandlers(db) {
  ipcMain.handle("save-timer", async (event, timer) => {
    try {
      console.log("Saving timer to database:", timer.id, timer.taskName)

      // Get the highest display_order and increment
      const maxOrderResult = db.prepare("SELECT MAX(display_order) as max_order FROM timers").get()
      const displayOrder = (maxOrderResult.max_order || 0) + 1

      const stmt = db.prepare(`
        INSERT INTO timers (
          id, task_name, hours, minutes, seconds, total_seconds, remaining_seconds,
          is_active, is_paused, sound_id, sound_url, sound_name,
          is_repeating, repeat_interval_seconds, is_negative, is_muted,
          primary_color, secondary_color, font_family, font_size,
          start_timestamp, pause_timestamp, total_paused_duration,
          last_started_at, last_paused_at, display_order
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)

      const result = stmt.run(
        timer.id,
        timer.taskName,
        timer.hours || 0,
        timer.minutes || 0,
        timer.seconds || 0,
        timer.totalSeconds,
        timer.remaining,
        timer.isActive ? 1 : 0,
        timer.isPaused ? 1 : 0,
        timer.soundId || null,
        timer.soundUrl || null,
        timer.soundName || null,
        timer.isRepeating ? 1 : 0,
        timer.repeatInterval || 0,
        timer.isNegative ? 1 : 0,
        timer.isMuted ? 1 : 0,
        timer.primaryColor || "#f59e0b",
        timer.secondaryColor || "#fbbf24",
        timer.fontFamily || "mono",
        timer.fontSize || "text-2xl",
        timer.startTimestamp || null,
        timer.pauseTimestamp || null,
        timer.totalPausedDuration || 0,
        timer.lastStartedAt || null,
        timer.lastPausedAt || null,
        displayOrder,
      )

      console.log(`Timer saved successfully. ID: ${timer.id}, Changes: ${result.changes}`)

      return timer
    } catch (error) {
      console.error("Error saving timer:", error)
      throw error
    }
  })

  ipcMain.handle("get-timers", async () => {
    try {
      const stmt = db.prepare("SELECT * FROM timers ORDER BY display_order ASC, created_at DESC")
      const timers = stmt.all()
      console.log(`Retrieved ${timers.length} timers from database`)

      return timers
    } catch (error) {
      console.error("Error getting timers:", error)
      return []
    }
  })

  ipcMain.handle("update-timer", async (event, timer) => {
    try {
      console.log("Updating timer in database:", timer.id, timer.taskName)

      const stmt = db.prepare(`
        UPDATE timers SET 
          task_name = ?, hours = ?, minutes = ?, seconds = ?, total_seconds = ?,
          remaining_seconds = ?, is_active = ?, is_paused = ?, sound_id = ?,
          sound_url = ?, sound_name = ?, is_repeating = ?, repeat_interval_seconds = ?,
          is_negative = ?, is_muted = ?, primary_color = ?, secondary_color = ?,
          font_family = ?, font_size = ?, 
          start_timestamp = ?, pause_timestamp = ?, total_paused_duration = ?,
          last_started_at = ?, last_paused_at = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `)

      const result = stmt.run(
        timer.taskName,
        timer.hours || 0,
        timer.minutes || 0,
        timer.seconds || 0,
        timer.totalSeconds,
        timer.remaining,
        timer.isActive ? 1 : 0,
        timer.isPaused ? 1 : 0,
        timer.soundId || null,
        timer.soundUrl || null,
        timer.soundName || null,
        timer.isRepeating ? 1 : 0,
        timer.repeatInterval || 0,
        timer.isNegative ? 1 : 0,
        timer.isMuted ? 1 : 0,
        timer.primaryColor || "#f59e0b",
        timer.secondaryColor || "#fbbf24",
        timer.fontFamily || "mono",
        timer.fontSize || "text-2xl",
        timer.startTimestamp || null,
        timer.pauseTimestamp || null,
        timer.totalPausedDuration || 0,
        timer.lastStartedAt || null,
        timer.lastPausedAt || null,
        timer.id,
      )

      console.log(`Timer updated. Changes: ${result.changes}`)
      return timer
    } catch (error) {
      console.error("Error updating timer:", error)
      throw error
    }
  })

  ipcMain.handle("update-timer-order", async (event, timerOrders) => {
    try {
      console.log("Updating timer order:", timerOrders)

      const stmt = db.prepare("UPDATE timers SET display_order = ? WHERE id = ?")
      const transaction = db.transaction((orders) => {
        for (const { id, order } of orders) {
          stmt.run(order, id)
        }
      })

      transaction(timerOrders)
      console.log("Timer order updated successfully")
      return true
    } catch (error) {
      console.error("Error updating timer order:", error)
      throw error
    }
  })

  ipcMain.handle("delete-timer", async (event, id) => {
    try {
      console.log("Deleting timer from database:", id)

      // Delete timer sessions first (foreign key constraint)
      const sessionStmt = db.prepare("DELETE FROM timer_sessions WHERE timer_id = ?")
      const sessionResult = sessionStmt.run(id)

      // Delete timer
      const timerStmt = db.prepare("DELETE FROM timers WHERE id = ?")
      const timerResult = timerStmt.run(id)

      console.log(
        `Deleted timer ${id}. Sessions deleted: ${sessionResult.changes}, Timer deleted: ${timerResult.changes}`,
      )
      return timerResult.changes > 0
    } catch (error) {
      console.error("Error deleting timer:", error)
      throw error
    }
  })
}

function setupSettingsHandlers(db) {
  ipcMain.handle("get-app-setting", async (event, key) => {
    try {
      const stmt = db.prepare("SELECT value FROM app_settings WHERE key = ?")
      const result = stmt.get(key)
      return result ? result.value : null
    } catch (error) {
      console.error("Error getting app setting:", error)
      return null
    }
  })

  ipcMain.handle("set-app-setting", async (event, { key, value }) => {
    try {
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO app_settings (key, value, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
      `)
      stmt.run(key, value)
      return true
    } catch (error) {
      console.error("Error setting app setting:", error)
      throw error
    }
  })
}

function setupTaskHandlers(db) {
  ipcMain.handle("save-task", async (event, task) => {
    try {
      const stmt = db.prepare(`
        INSERT INTO tasks (id, title, icon, duration, repeat, completed)
        VALUES (?, ?, ?, ?, ?, ?)
      `)

      stmt.run(task.id, task.title, task.icon, task.duration, task.repeat, task.completed)
      return task
    } catch (error) {
      console.error("Error saving task:", error)
      throw error
    }
  })

  ipcMain.handle("get-tasks", async () => {
    try {
      const stmt = db.prepare("SELECT * FROM tasks ORDER BY created_at DESC")
      return stmt.all()
    } catch (error) {
      console.error("Error getting tasks:", error)
      return []
    }
  })

  ipcMain.handle("update-task", async (event, task) => {
    try {
      const stmt = db.prepare(`
        UPDATE tasks 
        SET title = ?, icon = ?, duration = ?, repeat = ?, completed = ?
        WHERE id = ?
      `)

      stmt.run(task.title, task.icon, task.duration, task.repeat, task.completed, task.id)
      return task
    } catch (error) {
      console.error("Error updating task:", error)
      throw error
    }
  })

  ipcMain.handle("delete-task", async (event, id) => {
    try {
      db.prepare("DELETE FROM tasks WHERE id = ?").run(id)
      return true
    } catch (error) {
      console.error("Error deleting task:", error)
      throw error
    }
  })
}

module.exports = {
  setupIpcHandlers,
}
