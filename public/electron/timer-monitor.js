const { Notification } = require("electron")
const path = require("path")

let timerUpdateInterval
const activeNotifications = new Map() // Track active notifications

function startTimerMonitoring(db, mainWindow) {
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
          handleTimerCompletion(timer, db, mainWindow)
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
      updateWindowTitle(hasActiveTimer, shortestRemaining, activeTimerName, mainWindow)
    } catch (error) {
      console.error("Error in timer monitoring:", error)
    }
  }, 1000)
}

function handleTimerCompletion(timer, db, mainWindow) {
  if (Notification.isSupported()) {
    const notification = new Notification({
      title: "KāryaYāna Timer Completed! ⏰",
      body: `${timer.task_name} has finished`,
      icon: path.join(__dirname, "../icons/icon-64x64.png"),
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
}

function updateWindowTitle(hasActiveTimer, shortestRemaining, activeTimerName, mainWindow) {
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
}

function stopTimerMonitoring() {
  if (timerUpdateInterval) {
    clearInterval(timerUpdateInterval)
    timerUpdateInterval = null
  }
  // Clear all active notifications
  activeNotifications.clear()
}

function cancelTimerNotification(timerId) {
  const notification = activeNotifications.get(timerId)
  if (notification) {
    notification.close()
    activeNotifications.delete(timerId)
    return true
  }
  return false
}

module.exports = {
  startTimerMonitoring,
  stopTimerMonitoring,
  cancelTimerNotification,
}
