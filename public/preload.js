const { contextBridge, ipcRenderer } = require("electron")

contextBridge.exposeInMainWorld("electronAPI", {
  // Sound management
  uploadSound: (data) => ipcRenderer.invoke("upload-sound", data),
  getSounds: () => ipcRenderer.invoke("get-sounds"),
  deleteSound: (id) => ipcRenderer.invoke("delete-sound", id),
  updateSoundDuration: (data) => ipcRenderer.invoke("update-sound-duration", data),

  // Task management
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
