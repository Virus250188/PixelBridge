/**
 * Platform and File Type Constants
 * Centralized configuration for RetroArch platforms and file extensions
 */

// Platform extension mapping for auto-detection
const PLATFORM_EXTENSIONS = {
  // Nintendo
  nes: ['.nes', '.unf'],
  snes: ['.sfc', '.smc'],
  n64: ['.n64', '.z64', '.v64'],
  gb: ['.gb', '.gbc'],
  gba: ['.gba'],
  nds: ['.nds'],

  // Sony
  psx: ['.bin', '.cue', '.img', '.iso', '.chd'],
  psp: ['.iso', '.cso', '.pbp', '.chd'],

  // Sega
  genesis: ['.md', '.smd', '.gen', '.bin'],
  sms: ['.sms'],
  gamegear: ['.gg'],
  saturn: ['.cue', '.iso', '.chd'],
  dreamcast: ['.cdi', '.gdi', '.chd'],

  // Atari
  atari2600: ['.a26', '.bin'],
  atari7800: ['.a78', '.bin'],
  lynx: ['.lnx'],

  // Other
  neogeo: ['.zip'],
  ngp: ['.ngp', '.ngc'],
  pcengine: ['.pce', '.cue', '.ccd', '.chd'],
  wonderswan: ['.ws', '.wsc'],
  virtualboy: ['.vb', '.vboy'],

  // Arcade
  mame: ['.zip'],
  fbneo: ['.zip']
};

// All supported file extensions (flattened)
const SUPPORTED_EXTENSIONS = [
  // ROMs
  '.nes', '.unf', '.sfc', '.smc', '.n64', '.z64', '.v64',
  '.gb', '.gbc', '.gba', '.nds',
  '.md', '.smd', '.gen', '.sms', '.gg',
  '.a26', '.a78', '.lnx',
  '.ngp', '.ngc', '.pce', '.ws', '.wsc', '.vb', '.vboy',
  // Disc images
  '.bin', '.cue', '.img', '.iso', '.cso', '.chd',
  '.cdi', '.gdi', '.ccd', '.pbp',
  // Archives
  '.zip', '.7z'
];

// IGDB Platform IDs mapping
const IGDB_PLATFORM_IDS = {
  nes: 18,
  snes: 19,
  n64: 4,
  gb: 33,
  gba: 24,
  nds: 20,
  psx: 7,
  psp: 38,
  genesis: 29,
  sms: 64,
  gamegear: 35,
  saturn: 32,
  dreamcast: 23,
  atari2600: 59,
  atari7800: 60,
  lynx: 46,
  neogeo: 80,
  ngp: 119,
  pcengine: 86,
  wonderswan: 57,
  virtualboy: 87,
  mame: 52
};

// File size limits (in bytes)
const FILE_SIZE_LIMITS = {
  MAX_ROM_SIZE: 4 * 1024 * 1024 * 1024,  // 4GB
  MAX_COVER_SIZE: 10 * 1024 * 1024,      // 10MB
  UPLOAD_TIMEOUT: 120000                  // 2 minutes
};

// RetroArch WebUI defaults
const RETROARCH_DEFAULTS = {
  DEFAULT_IP: '192.168.6.125',
  DEFAULT_PORT: 80,
  WEBDAV_PORT: 8080,
  UPLOAD_ENDPOINT: '/upload',
  DEFAULT_UPLOAD_PATH: 'downloads',
  CONNECTION_TIMEOUT: 5000,
  UPLOAD_TIMEOUT: 120000
};

// File hash algorithms
const HASH_ALGORITHMS = {
  MD5: 'md5',
  SHA256: 'sha256'
};

module.exports = {
  PLATFORM_EXTENSIONS,
  SUPPORTED_EXTENSIONS,
  IGDB_PLATFORM_IDS,
  FILE_SIZE_LIMITS,
  RETROARCH_DEFAULTS,
  HASH_ALGORITHMS
};
