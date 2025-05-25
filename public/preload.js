const { contextBridge, ipcRenderer } = require("electron")

contextBridge.exposeInMainWorld("electronAPI", {
  // System timestamp for accurate timer calculations
  getCurrentTimestamp: () => ipcRenderer.invoke("get-current-timestamp"),

  // Notification management
  cancelTimerNotification: (timerId) => ipcRenderer.invoke("cancel-timer-notification", timerId),

  // Sound management
  uploadSound: (data) => ipcRenderer.invoke("upload-sound", data),
  getSounds: () => ipcRenderer.invoke("get-sounds"),
  deleteSound: (id) => ipcRenderer.invoke("delete-sound", id),
  updateSoundDuration: (data) => ipcRenderer.invoke("update-sound-duration", data),

  // Enhanced Timer management
  saveTimer: (timer) => ipcRenderer.invoke("save-timer", timer),
  getTimers: () => ipcRenderer.invoke("get-timers"),
  updateTimer: (timer) => ipcRenderer.invoke("update-timer", timer),
  updateTimerOrder: (timerOrders) => ipcRenderer.invoke("update-timer-order", timerOrders),
  deleteTimer: (id) => ipcRenderer.invoke("delete-timer", id),
  getTimerSchema: () => ipcRenderer.invoke("get-timer-schema"),

  // App settings
  getAppSetting: (key) => ipcRenderer.invoke("get-app-setting", key),
  setAppSetting: (data) => ipcRenderer.invoke("set-app-setting", data),

  // Task management (existing)
  saveTask: (task) => ipcRenderer.invoke("save-task", task),
  getTasks: () => ipcRenderer.invoke("get-tasks"),
  updateTask: (task) => ipcRenderer.invoke("update-task", task),
  deleteTask: (id) => ipcRenderer.invoke("delete-task", id),

  // Event listeners
  on: (channel, callback) => {
    ipcRenderer.on(channel, callback)
  },
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel)
  },
})
