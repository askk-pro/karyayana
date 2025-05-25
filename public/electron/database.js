const Database = require("better-sqlite3")
const path = require("path")
const fs = require("fs")
const { app } = require("electron")

let db

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

  // Create tables with initial schema
  createTables()

  // Run database migrations
  runMigrations()

  console.log("Database initialized successfully")

  // Log current timer count
  const timerCount = db.prepare("SELECT COUNT(*) as count FROM timers").get()
  console.log("Current timers in database:", timerCount.count)

  return db
}

function createTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS sounds (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      filename TEXT NOT NULL,
      filepath TEXT NOT NULL,
      duration REAL,
      volume REAL DEFAULT 1.0,
      start_time REAL DEFAULT 0,
      end_time REAL,
      primary_color TEXT DEFAULT '#3b82f6',
      secondary_color TEXT DEFAULT '#60a5fa',
      display_order INTEGER DEFAULT 0,
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
      
      -- Display order
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
}

function runMigrations() {
  console.log("Running database migrations...")

  // Check if display_order column exists in timers
  const timerTableInfo = db.prepare("PRAGMA table_info(timers)").all()
  const hasTimerDisplayOrder = timerTableInfo.some((column) => column.name === "display_order")

  if (!hasTimerDisplayOrder) {
    console.log("Adding display_order column to timers table...")
    try {
      db.exec("ALTER TABLE timers ADD COLUMN display_order INTEGER DEFAULT 0")

      const existingTimers = db.prepare("SELECT id FROM timers ORDER BY created_at ASC").all()
      const updateStmt = db.prepare("UPDATE timers SET display_order = ? WHERE id = ?")

      existingTimers.forEach((timer, index) => {
        updateStmt.run(index, timer.id)
      })

      console.log(`Updated ${existingTimers.length} existing timers with display order`)
    } catch (error) {
      console.error("Error adding display_order column to timers:", error)
    }
  }

  // Check if new sound columns exist
  const soundTableInfo = db.prepare("PRAGMA table_info(sounds)").all()
  const soundColumns = soundTableInfo.map((col) => col.name)

  const newSoundColumns = [
    { name: "volume", type: "REAL DEFAULT 1.0" },
    { name: "start_time", type: "REAL DEFAULT 0" },
    { name: "end_time", type: "REAL" },
    { name: "primary_color", type: "TEXT DEFAULT '#3b82f6'" },
    { name: "secondary_color", type: "TEXT DEFAULT '#60a5fa'" },
    { name: "display_order", type: "INTEGER DEFAULT 0" },
  ]

  for (const column of newSoundColumns) {
    if (!soundColumns.includes(column.name)) {
      console.log(`Adding ${column.name} column to sounds table...`)
      try {
        db.exec(`ALTER TABLE sounds ADD COLUMN ${column.name} ${column.type}`)
      } catch (error) {
        console.error(`Error adding ${column.name} column to sounds:`, error)
      }
    }
  }

  // Update existing sounds with display order
  const existingSounds = db.prepare("SELECT id FROM sounds WHERE display_order = 0 ORDER BY created_at ASC").all()
  if (existingSounds.length > 0) {
    console.log("Updating existing sounds with display order...")
    const updateSoundStmt = db.prepare("UPDATE sounds SET display_order = ? WHERE id = ?")

    existingSounds.forEach((sound, index) => {
      updateSoundStmt.run(index + 1, sound.id)
    })

    console.log(`Updated ${existingSounds.length} existing sounds with display order`)
  }

  console.log("Database migrations completed")
}

function closeDatabase() {
  if (db) {
    db.close()
    console.log("Database connection closed")
  }
}

module.exports = {
  initDatabase,
  closeDatabase,
  getDatabase: () => db,
}
