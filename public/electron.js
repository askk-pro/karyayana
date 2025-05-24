const { app, BrowserWindow, Menu } = require("electron")
const path = require("path")

// Simple development check without external dependency
const isDev = process.env.NODE_ENV === "development" || !app.isPackaged

let mainWindow

function createWindow() {
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

    // Open DevTools in development
    if (isDev) {
        mainWindow.webContents.openDevTools()
    }

    // Handle window closed
    mainWindow.on("closed", () => {
        mainWindow = null
    })

    // Create application menu
    createMenu()
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
                { label: "Actual Size", accelerator: "CmdOrCtrl+0", role: "resetZoom" },
                { label: "Zoom In", accelerator: "CmdOrCtrl+Plus", role: "zoomIn" },
                { label: "Zoom Out", accelerator: "CmdOrCtrl+-", role: "zoomOut" },
                { type: "separator" },
                { label: "Toggle Fullscreen", accelerator: "F11", role: "togglefullscreen" },
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
    if (process.platform !== "darwin") {
        app.quit()
    }
})

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})

// Security: Prevent new window creation
app.on("web-contents-created", (event, contents) => {
    contents.on("new-window", (event, navigationUrl) => {
        event.preventDefault()
    })
})
