const { app, BrowserWindow } = require("electron")
const path = require("path")
const { initDatabase } = require("./electron/database")
const { setupIpcHandlers } = require("./electron/ipc-handlers")
const { registerShortcuts } = require("./electron/shortcuts")
const { createMenu } = require("./electron/menu")
const { startTimerMonitoring } = require("./electron/timer-monitor")
const { createSoundsDirectory } = require("./electron/utils")

// Simple development check without external dependency
const isDev = process.env.NODE_ENV === "development" || !app.isPackaged

let mainWindow

function createWindow() {
  // Initialize database
  const db = initDatabase()

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
    startTimerMonitoring(db, mainWindow)
  })

  // Handle window closed
  mainWindow.on("closed", () => {
    mainWindow = null
  })

  // Register global shortcuts
  registerShortcuts(mainWindow)

  // Create application menu
  createMenu(mainWindow)

  // Setup IPC handlers
  setupIpcHandlers(db, soundsPath, isDev)

  return mainWindow
}

// App event listeners
app.whenReady().then(() => {
  mainWindow = createWindow()
})

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit()
  }
})

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    mainWindow = createWindow()
  }
})

// Export for other modules
module.exports = { mainWindow }
