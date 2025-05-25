const { globalShortcut } = require("electron")

function registerShortcuts(mainWindow) {
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

function unregisterAllShortcuts() {
  globalShortcut.unregisterAll()
}

module.exports = {
  registerShortcuts,
  unregisterAllShortcuts,
}
