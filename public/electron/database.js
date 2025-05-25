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

  // Check if display_order column exists
  const tableInfo = db.prepare("PRAGMA table_info(timers)").all()
  const hasDisplayOrder = tableInfo.some((column) => column.name === "display_order")

  if (!hasDisplayOrder) {
    console.log("Adding display_order column to timers table...")
    try {
      // Add the display_order column
      db.exec("ALTER TABLE timers ADD COLUMN display_order INTEGER DEFAULT 0")

      // Update existing timers with sequential order based on created_at
      const existingTimers = db.prepare("SELECT id FROM timers ORDER BY created_at ASC").all()
      const updateStmt = db.prepare("UPDATE timers SET display_order = ? WHERE id = ?")

      existingTimers.forEach((timer, index) => {
        updateStmt.run(index, timer.id)
      })

      console.log(`Updated ${existingTimers.length} existing timers with display order`)
    } catch (error) {
      console.error("Error adding display_order column:", error)
    }
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
