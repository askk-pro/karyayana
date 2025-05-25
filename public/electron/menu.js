const { Menu, app } = require("electron")

function createMenu(mainWindow) {
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

module.exports = {
  createMenu,
}
