/**
 * Database Configuration
 * SQLite database setup with sqlite3
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Import centralized config to ensure consistent paths
const config = require('./env');

// Use the centralized DATABASE_PATH from env.js
const DB_PATH = config.DATABASE_PATH;

// Ensure database directory exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize database connection
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    // Enable foreign keys
    db.run('PRAGMA foreign_keys = ON');
    // Enable WAL mode for better concurrent access
    db.run('PRAGMA journal_mode = WAL');
  }
});

/**
 * Run database migrations
 */
function runMigrations(callback) {
  console.log('Running database migrations...');

  const migrationPath = path.join(__dirname, '../database/migrations/001_initial.sql');
  const migration = fs.readFileSync(migrationPath, 'utf8');

  db.exec(migration, (err) => {
    if (err) {
      console.error('✗ Migration failed:', err.message);
      callback(err);
    } else {
      console.log('✓ Migration 001_initial.sql completed');
      callback(null);
    }
  });
}

/**
 * Run database seeds
 */
function runSeeds(callback) {
  console.log('Running database seeds...');

  const seedPath = path.join(__dirname, '../database/seeds/platforms.sql');
  const seed = fs.readFileSync(seedPath, 'utf8');

  db.exec(seed, (err) => {
    if (err) {
      console.error('✗ Seeding failed:', err.message);
      callback(err);
    } else {
      console.log('✓ Platform seeds completed');
      callback(null);
    }
  });
}

/**
 * Initialize settings from environment variables
 */
function initializeSettings(callback) {
  const config = require('./env');

  // Update settings from environment variables (if they exist)
  const settings = [
    { key: 'retroarch_ip', value: config.RETROARCH_IP },
    { key: 'retroarch_port', value: String(config.RETROARCH_PORT) }
  ];

  let completed = 0;
  let hasError = false;

  settings.forEach(setting => {
    db.run(
      'INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
      [setting.key, setting.value],
      (err) => {
        if (err && !hasError) {
          hasError = true;
          console.error(`✗ Failed to set ${setting.key}:`, err.message);
          callback(err);
          return;
        }
        completed++;
        if (completed === settings.length && !hasError) {
          console.log('✓ Settings initialized from environment');
          callback(null);
        }
      }
    );
  });
}

/**
 * Initialize database (migrations + seeds + settings)
 */
function initializeDatabase(callback) {
  runMigrations((err) => {
    if (err) {
      console.error('✗ Database initialization failed:', err);
      if (callback) callback(err);
      else process.exit(1);
      return;
    }

    runSeeds((err) => {
      if (err) {
        console.error('✗ Database initialization failed:', err);
        if (callback) callback(err);
        else process.exit(1);
        return;
      }

      // Initialize settings from environment variables
      initializeSettings((err) => {
        if (err) {
          console.error('✗ Database initialization failed:', err);
          if (callback) callback(err);
          else process.exit(1);
          return;
        }

        console.log('✓ Database initialized successfully');
        if (callback) callback(null);
      });
    });
  });
}

/**
 * Close database connection
 */
function closeDatabase() {
  db.close();
  console.log('Database connection closed');
}

// Graceful shutdown
process.on('SIGINT', () => {
  closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', () => {
  closeDatabase();
  process.exit(0);
});

module.exports = {
  db,
  initializeDatabase,
  runMigrations,
  runSeeds,
  closeDatabase
};
