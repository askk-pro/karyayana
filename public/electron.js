const { app, BrowserWindow, Menu, globalShortcut, ipcMain, dialog, Notification } = require("electron")
const path = require("path")
const fs = require("fs")
const Database = require("better-sqlite3")

// Simple development check without external dependency
const isDev = process.env.NODE_ENV === "development" || !app.isPackaged

let mainWindow
let db
let timerUpdateInterval
const activeNotifications = new Map() // Track active notifications

// Database setup
function initDatabase() {
  const userDataPath = app.getPath("userData")
  const dbPath = path.join(userDataPath, "karyayana.db")

  console.log("Initializing database at:", dbPath)

  // Ensure user data directory exists
  if (!fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath, { recursive: true })
  }

  db = new Database(dbPath)

  // Enable foreign keys
  db.pragma("foreign_keys = ON")

  // Create tables with correct schema including timestamp fields
  db.exec(`
    CREATE TABLE IF NOT EXISTS sounds (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      filename TEXT NOT NULL,
      filepath TEXT NOT NULL,
      duration REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      icon TEXT NOT NULL,
      duration INTEGER NOT NULL,
      repeat BOOLEAN DEFAULT FALSE,
      completed BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS timers (
      id TEXT PRIMARY KEY,
      task_name TEXT NOT NULL,
      hours INTEGER NOT NULL DEFAULT 0,
      minutes INTEGER NOT NULL DEFAULT 0,
      seconds INTEGER NOT NULL DEFAULT 0,
      total_seconds INTEGER NOT NULL,
      remaining_seconds INTEGER NOT NULL,
      is_active BOOLEAN DEFAULT FALSE,
      is_paused BOOLEAN DEFAULT FALSE,
      sound_id TEXT,
      sound_url TEXT,
      sound_name TEXT,
      
      -- Advanced features
      is_repeating BOOLEAN DEFAULT FALSE,
      repeat_interval_seconds INTEGER DEFAULT 0,
      is_negative BOOLEAN DEFAULT FALSE,
      is_muted BOOLEAN DEFAULT FALSE,
      
      -- Timer customization
      primary_color TEXT DEFAULT '#f59e0b',
      secondary_color TEXT DEFAULT '#fbbf24',
      font_family TEXT DEFAULT 'mono',
      font_size TEXT DEFAULT 'text-2xl',
      
      -- Timestamp tracking for accurate time calculation
      start_timestamp INTEGER,
      pause_timestamp INTEGER,
      total_paused_duration INTEGER DEFAULT 0,
      
      -- Order for drag and drop
      display_order INTEGER DEFAULT 0,
      
      -- Timestamps
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_started_at DATETIME,
      last_paused_at DATETIME,
      
      FOREIGN KEY (sound_id) REFERENCES sounds (id)
    );

    CREATE TABLE IF NOT EXISTS timer_sessions (
      id TEXT PRIMARY KEY,
      timer_id TEXT NOT NULL,
      started_at DATETIME NOT NULL,
      ended_at DATETIME,
      duration_seconds INTEGER,
      completed BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (timer_id) REFERENCES timers (id)
    );

    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Insert default settings
    INSERT OR IGNORE INTO app_settings (key, value) VALUES 
      ('global_mute', 'false'),
      ('default_timer_color', '#f59e0b'),
      ('auto_save_interval', '5');
  `)

  console.log("Database initialized successfully")

  // Log current timer count
  const timerCount = db.prepare("SELECT COUNT(*) as count FROM timers").get()
  console.log("Current timers in database:", timerCount.count)
}

// Create sounds directory
function createSoundsDirectory() {
  const soundsPath = path.join(__dirname, "sounds")

  if (!fs.existsSync(soundsPath)) {
    fs.mkdirSync(soundsPath, { recursive: true })
    console.log("Created sounds folder at:", soundsPath)
  }

  return soundsPath
}

// Timer monitoring for system notifications and taskbar updates
function startTimerMonitoring() {
  if (timerUpdateInterval) {
    clearInterval(timerUpdateInterval)
  }

  timerUpdateInterval = setInterval(() => {
    try {
      const activeTimers = db
        .prepare(
          `
        SELECT * FROM timers 
        WHERE is_active = 1 AND is_paused = 0
      `,
        )
        .all()

      let hasActiveTimer = false
      let shortestRemaining = Number.POSITIVE_INFINITY
      let activeTimerName = ""

      for (const timer of activeTimers) {
        const now = Date.now()
        const startTime = timer.start_timestamp || now
        const pausedDuration = timer.total_paused_duration || 0
        const elapsedSeconds = Math.floor((now - startTime) / 1000) - pausedDuration
        const remaining = timer.total_seconds - elapsedSeconds

        if (remaining <= 0 && !timer.is_negative) {
          // Timer completed - send notification with cancel functionality
          if (Notification.isSupported()) {
            const notification = new Notification({
              title: "KāryaYāna Timer Completed! ⏰",
              body: `${timer.task_name} has finished`,
              icon: path.join(__dirname, "icons/icon-64x64.png"),
              urgency: "normal",
              timeoutType: "never", // Keep notification until user interacts
              silent: false,
            })

            // Store notification reference for potential cancellation
            activeNotifications.set(timer.id, notification)

            notification.on("click", () => {
              if (mainWindow) {
                mainWindow.focus()
                mainWindow.webContents.send("focus-timer", timer.id)
              }
              // Remove from active notifications when clicked
              activeNotifications.delete(timer.id)
            })

            notification.on("close", () => {
              // Remove from active notifications when closed
              activeNotifications.delete(timer.id)
              // Send signal to stop any playing audio
              if (mainWindow) {
                mainWindow.webContents.send("stop-timer-audio", timer.id)
              }
            })

            notification.show()
          }

          // Update timer as completed
          db.prepare(
            `
            UPDATE timers 
            SET is_active = 0, is_paused = 0, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `,
          ).run(timer.id)

          // Handle repeating timers
          if (timer.is_repeating && timer.repeat_interval_seconds > 0) {
            setTimeout(() => {
              db.prepare(
                `
                UPDATE timers 
                SET is_active = 1, is_paused = 0, 
                    start_timestamp = ?, total_paused_duration = 0,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
              `,
              ).run(Date.now(), timer.id)
            }, timer.repeat_interval_seconds * 1000)
          }
        } else {
          hasActiveTimer = true
          const actualRemaining = timer.is_negative ? remaining : Math.max(0, remaining)
          if (Math.abs(actualRemaining) < Math.abs(shortestRemaining)) {
            shortestRemaining = actualRemaining
            activeTimerName = timer.task_name
          }
        }
      }

      // Update window title for taskbar
      if (hasActiveTimer && mainWindow) {
        const formatTime = (s) => {
          const isNeg = s < 0
          const absSeconds = Math.abs(s)
          const mins = Math.floor(absSeconds / 60)
          const secs = absSeconds % 60
          const timeStr = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
          return isNeg ? `-${timeStr}` : timeStr
        }

        const title = `⏱️ ${formatTime(shortestRemaining)} - ${activeTimerName} | KāryaYāna`
        mainWindow.setTitle(title)
      } else if (mainWindow) {
        mainWindow.setTitle("KāryaYāna - Your Daily Journey of Action")
      }
    } catch (error) {
      console.error("Error in timer monitoring:", error)
    }
  }, 1000)
}

function createWindow() {
  // Initialize database
  initDatabase()

  // Create sounds directory
  const soundsPath = createSoundsDirectory()

  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    icon: path.join(__dirname, process.platform === "win32" ? "icon.ico" : "icons/icon-512x512.png"),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: false, // Allow loading local files
      preload: path.join(__dirname, "preload.js"),
    },
    titleBarStyle: "default",
    show: false,
  })

  // Load the app
  const startUrl = isDev ? "http://localhost:3000" : `file://${path.join(__dirname, "../out/index.html")}`

  mainWindow.loadURL(startUrl)

  // Show window when ready to prevent visual flash
  mainWindow.once("ready-to-show", () => {
    mainWindow.show()
    // Start timer monitoring after window is ready
    startTimerMonitoring()
  })

  // Handle window closed
  mainWindow.on("closed", () => {
    mainWindow = null
    if (timerUpdateInterval) {
      clearInterval(timerUpdateInterval)
    }
    // Clear all active notifications
    activeNotifications.clear()
    if (db) {
      db.close()
    }
  })

  // Register global shortcuts
  registerShortcuts()

  // Create application menu
  createMenu()

  // Setup IPC handlers
  setupIpcHandlers(soundsPath)
}

function setupIpcHandlers(soundsPath) {
  // Get current system timestamp
  ipcMain.handle("get-current-timestamp", () => {
    return Date.now()
  })

  // Cancel timer notification and audio
  ipcMain.handle("cancel-timer-notification", (event, timerId) => {
    const notification = activeNotifications.get(timerId)
    if (notification) {
      notification.close()
      activeNotifications.delete(timerId)
      return true
    }
    return false
  })

  // Sound management
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

  // Enhanced Timer management with timestamp-based calculations
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

      // Verify the save
      const saved = db.prepare("SELECT * FROM timers WHERE id = ?").get(timer.id)
      console.log("Verified saved timer:", saved ? "Found" : "Not found")

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

      // Log timer details for debugging
      timers.forEach((timer) => {
        console.log(`Timer: ${timer.id} - ${timer.task_name} (${timer.total_seconds}s) Order: ${timer.display_order}`)
      })

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

      if (result.changes === 0) {
        console.warn(`No timer found with ID: ${timer.id}`)
      }
      return timer
    } catch (error) {
      console.error("Error updating timer:", error)
      throw error
    }
  })

  // Update timer order for drag and drop
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

  // App settings
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

  // Task management (existing)
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

function registerShortcuts() {
  // Ctrl/Cmd + N: New Task
  globalShortcut.register("CommandOrControl+N", () => {
    if (mainWindow) {
      mainWindow.webContents.send("shortcut-new-task")
    }
  })

  // Ctrl/Cmd + T: New Timer
  globalShortcut.register("CommandOrControl+T", () => {
    if (mainWindow) {
      mainWindow.webContents.send("shortcut-new-timer")
    }
  })

  // Ctrl/Cmd + Space: Start/Pause Timer
  globalShortcut.register("CommandOrControl+Space", () => {
    if (mainWindow) {
      mainWindow.webContents.send("shortcut-toggle-timer")
    }
  })

  // Ctrl/Cmd + B: Toggle Sidebar
  globalShortcut.register("CommandOrControl+B", () => {
    if (mainWindow) {
      mainWindow.webContents.send("shortcut-toggle-sidebar")
    }
  })

  // Ctrl/Cmd + D: Toggle Theme
  globalShortcut.register("CommandOrControl+D", () => {
    if (mainWindow) {
      mainWindow.webContents.send("shortcut-toggle-theme")
    }
  })
}

function createMenu() {
  const template = [
    {
      label: "KāryaYāna",
      submenu: [
        {
          label: "About KāryaYāna",
          role: "about",
        },
        { type: "separator" },
        {
          label: "New Task",
          accelerator: "CommandOrControl+N",
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send("shortcut-new-task")
            }
          },
        },
        {
          label: "New Timer",
          accelerator: "CommandOrControl+T",
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send("shortcut-new-timer")
            }
          },
        },
        { type: "separator" },
        {
          label: "Hide KāryaYāna",
          accelerator: "Command+H",
          role: "hide",
        },
        {
          label: "Hide Others",
          accelerator: "Command+Shift+H",
          role: "hideothers",
        },
        {
          label: "Show All",
          role: "unhide",
        },
        { type: "separator" },
        {
          label: "Quit",
          accelerator: "Command+Q",
          click: () => {
            app.quit()
          },
        },
      ],
    },
    {
      label: "Edit",
      submenu: [
        { label: "Undo", accelerator: "CmdOrCtrl+Z", role: "undo" },
        { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", role: "redo" },
        { type: "separator" },
        { label: "Cut", accelerator: "CmdOrCtrl+X", role: "cut" },
        { label: "Copy", accelerator: "CmdOrCtrl+C", role: "copy" },
        { label: "Paste", accelerator: "CmdOrCtrl+V", role: "paste" },
      ],
    },
    {
      label: "View",
      submenu: [
        { label: "Reload", accelerator: "CmdOrCtrl+R", role: "reload" },
        { label: "Force Reload", accelerator: "CmdOrCtrl+Shift+R", role: "forceReload" },
        { label: "Toggle Developer Tools", accelerator: "F12", role: "toggleDevTools" },
        { type: "separator" },
        {
          label: "Toggle Sidebar",
          accelerator: "CmdOrCtrl+B",
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send("shortcut-toggle-sidebar")
            }
          },
        },
        {
          label: "Toggle Theme",
          accelerator: "CmdOrCtrl+D",
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send("shortcut-toggle-theme")
            }
          },
        },
        { type: "separator" },
        { label: "Actual Size", accelerator: "CmdOrCtrl+0", role: "resetZoom" },
        { label: "Zoom In", accelerator: "CmdOrCtrl+Plus", role: "zoomIn" },
        { label: "Zoom Out", accelerator: "CmdOrCtrl+-", role: "zoomOut" },
        { type: "separator" },
        { label: "Toggle Fullscreen", accelerator: "F11", role: "togglefullscreen" },
      ],
    },
    {
      label: "Timer",
      submenu: [
        {
          label: "Start/Pause Timer",
          accelerator: "CmdOrCtrl+Space",
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send("shortcut-toggle-timer")
            }
          },
        },
      ],
    },
    {
      label: "Window",
      submenu: [
        { label: "Minimize", accelerator: "CmdOrCtrl+M", role: "minimize" },
        { label: "Close", accelerator: "CmdOrCtrl+W", role: "close" },
      ],
    },
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

// App event listeners
app.whenReady().then(createWindow)

app.on("window-all-closed", () => {
  // Unregister all shortcuts
  globalShortcut.unregisterAll()

  // Stop timer monitoring
  if (timerUpdateInterval) {
    clearInterval(timerUpdateInterval)
  }

  // Clear all active notifications
  activeNotifications.clear()

  if (process.platform !== "darwin") {
    app.quit()
  }
})

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.on("will-quit", () => {
  // Unregister all shortcuts
  globalShortcut.unregisterAll()

  // Stop timer monitoring
  if (timerUpdateInterval) {
    clearInterval(timerUpdateInterval)
  }

  // Clear all active notifications
  activeNotifications.clear()

  // Close database
  if (db) {
    db.close()
  }
})

// Security: Prevent new window creation
app.on("web-contents-created", (event, contents) => {
  contents.on("new-window", (event, navigationUrl) => {
    event.preventDefault()
  })
})
