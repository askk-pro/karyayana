const { app, BrowserWindow, Menu, globalShortcut, ipcMain, dialog } = require("electron")
const path = require("path")
const fs = require("fs")
const Database = require("better-sqlite3")

// Simple development check without external dependency
const isDev = process.env.NODE_ENV === "development" || !app.isPackaged

let mainWindow
let db

// Database setup
function initDatabase() {
  const userDataPath = app.getPath("userData")
  const dbPath = path.join(userDataPath, "karyayana.db")

  // Ensure user data directory exists
  if (!fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath, { recursive: true })
  }

  db = new Database(dbPath)

  // Create tables
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
      hours INTEGER NOT NULL,
      minutes INTEGER NOT NULL,
      seconds INTEGER NOT NULL,
      total_seconds INTEGER NOT NULL,
      sound_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sound_id) REFERENCES sounds (id)
    );
  `)

  console.log("Database initialized at:", dbPath)
}

// Create sounds directory
function createSoundsDirectory() {
  const userDataPath = app.getPath("userData")
  const soundsPath = path.join(app.getAppPath(), "public", "sounds")

  if (!fs.existsSync(soundsPath)) {
    fs.mkdirSync(soundsPath, { recursive: true })
    console.log("Created public/sounds folder at:", soundsPath)
  }

  return soundsPath
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
      webSecurity: true,
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
  })

  // Handle window closed
  mainWindow.on("closed", () => {
    mainWindow = null
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
        url: `http://localhost:3000/sounds/${filename}`,
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
        url: `http://localhost:3000/sounds/${sound.filename}`,
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

  // Task management
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
