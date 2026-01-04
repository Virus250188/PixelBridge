-- RetroArch ROM Library Database Schema
-- Migration: 001_initial

-- Platforms table
CREATE TABLE IF NOT EXISTS platforms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    short_name TEXT NOT NULL UNIQUE,
    description TEXT,
    manufacturer TEXT,
    retroarch_core TEXT,
    supported_extensions TEXT,  -- JSON array: [".nes", ".zip"]
    icon_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ROMs table
CREATE TABLE IF NOT EXISTS roms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    platform_id INTEGER NOT NULL,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL UNIQUE,
    file_size INTEGER,
    file_hash TEXT,  -- MD5 hash for deduplication

    -- Metadata from IGDB/ScreenScraper
    description TEXT,
    release_date TEXT,
    publisher TEXT,
    developer TEXT,
    genre TEXT,
    rating REAL,
    players INTEGER,

    -- Media paths
    cover_image_path TEXT,
    screenshot_path TEXT,
    video_url TEXT,

    -- IGDB/ScreenScraper IDs for future updates
    igdb_id INTEGER,
    screenscraper_id INTEGER,

    -- User data
    favorite BOOLEAN DEFAULT 0,
    play_count INTEGER DEFAULT 0,
    last_played DATETIME,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (platform_id) REFERENCES platforms(id) ON DELETE CASCADE
);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Push history table (track pushes to Apple TV)
CREATE TABLE IF NOT EXISTS push_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rom_id INTEGER NOT NULL,
    retroarch_ip TEXT NOT NULL,
    status TEXT NOT NULL,  -- 'success', 'failed'
    error_message TEXT,
    pushed_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (rom_id) REFERENCES roms(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_roms_platform ON roms(platform_id);
CREATE INDEX IF NOT EXISTS idx_roms_title ON roms(title);
CREATE INDEX IF NOT EXISTS idx_roms_favorite ON roms(favorite);
CREATE INDEX IF NOT EXISTS idx_roms_file_hash ON roms(file_hash);
CREATE INDEX IF NOT EXISTS idx_push_history_rom ON push_history(rom_id);
CREATE INDEX IF NOT EXISTS idx_push_history_status ON push_history(status);

-- Insert default settings
INSERT OR IGNORE INTO settings (key, value) VALUES ('retroarch_ip', '192.168.6.125');
INSERT OR IGNORE INTO settings (key, value) VALUES ('retroarch_port', '80');
INSERT OR IGNORE INTO settings (key, value) VALUES ('auto_fetch_metadata', 'true');
INSERT OR IGNORE INTO settings (key, value) VALUES ('default_upload_path', 'downloads');
