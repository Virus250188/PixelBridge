/**
 * Environment Configuration
 * Centralized environment variable management
 */

require('dotenv').config();

const path = require('path');

// Determine base storage path (absolute)
// User only needs to set STORAGE_PATH, everything else is derived from it
const STORAGE_BASE = process.env.STORAGE_PATH
  ? path.resolve(process.env.STORAGE_PATH)
  : path.join(__dirname, '../../storage');

const config = {
  // Server
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Storage (base path) - User only sets this ONE variable
  STORAGE_PATH: STORAGE_BASE,

  // All subdirectories are automatically derived from STORAGE_PATH
  // No need for user to configure these individually
  DATABASE_PATH: path.join(STORAGE_BASE, 'database', 'retroarch.db'),
  ROMS_PATH: path.join(STORAGE_BASE, 'roms'),
  COVERS_PATH: path.join(STORAGE_BASE, 'covers'),
  METADATA_PATH: path.join(STORAGE_BASE, 'metadata'),

  // RetroArch
  RETROARCH_IP: process.env.RETROARCH_IP || '192.168.1.100',
  RETROARCH_PORT: process.env.RETROARCH_PORT || '80',

  // IGDB API
  IGDB_CLIENT_ID: process.env.IGDB_CLIENT_ID || '',
  IGDB_CLIENT_SECRET: process.env.IGDB_CLIENT_SECRET || '',
  IGDB_ACCESS_TOKEN: process.env.IGDB_ACCESS_TOKEN || '', // Optional - will be auto-generated if not provided

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

  if (!config.IGDB_CLIENT_ID) {
    warnings.push('⚠ IGDB_CLIENT_ID not configured. Metadata fetching will be disabled.');
  } else if (!config.IGDB_CLIENT_SECRET && !config.IGDB_ACCESS_TOKEN) {
    warnings.push('⚠ Neither IGDB_CLIENT_SECRET nor IGDB_ACCESS_TOKEN configured.');
    warnings.push('  Provide IGDB_CLIENT_SECRET for automatic token generation, or IGDB_ACCESS_TOKEN for manual token.');
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
