/**
 * Environment Configuration
 * Centralized environment variable management
 */

require('dotenv').config();

const config = {
  // Server
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Database
  DATABASE_PATH: process.env.DATABASE_PATH || './database/retroarch.db',

  // Storage
  STORAGE_PATH: process.env.STORAGE_PATH || './storage',
  ROMS_PATH: process.env.ROMS_PATH || './storage/roms',
  COVERS_PATH: process.env.COVERS_PATH || './storage/covers',
  METADATA_PATH: process.env.METADATA_PATH || './storage/metadata',

  // RetroArch
  RETROARCH_IP: process.env.RETROARCH_IP || '192.168.6.125',
  RETROARCH_PORT: process.env.RETROARCH_PORT || '80',

  // IGDB API
  IGDB_CLIENT_ID: process.env.IGDB_CLIENT_ID || '',
  IGDB_ACCESS_TOKEN: process.env.IGDB_ACCESS_TOKEN || '',

  // ScreenScraper API (fallback)
  SCREENSCRAPER_DEV_ID: process.env.SCREENSCRAPER_DEV_ID || '',
  SCREENSCRAPER_DEV_PASSWORD: process.env.SCREENSCRAPER_DEV_PASSWORD || '',
  SCREENSCRAPER_USERNAME: process.env.SCREENSCRAPER_USERNAME || '',
  SCREENSCRAPER_PASSWORD: process.env.SCREENSCRAPER_PASSWORD || '',

  // File Upload
  MAX_FILE_SIZE: process.env.MAX_FILE_SIZE || 4294967296, // 4GB
  ALLOWED_EXTENSIONS: process.env.ALLOWED_EXTENSIONS || '.nes,.snes,.sfc,.gb,.gbc,.gba,.iso,.bin,.cue,.smd,.md,.gen,.gg,.cdi,.gdi,.zip,.7z',

  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173'
};

// Validate required environment variables
function validateConfig() {
  const warnings = [];

  if (!config.IGDB_CLIENT_ID || !config.IGDB_ACCESS_TOKEN) {
    warnings.push('⚠ IGDB API credentials not configured. Metadata fetching will be disabled.');
  }

  if (warnings.length > 0) {
    console.log('\nConfiguration Warnings:');
    warnings.forEach(warning => console.log(warning));
    console.log('');
  }
}

module.exports = {
  ...config,
  validateConfig
};
