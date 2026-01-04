/**
 * RetroArch Playlist Generator
 * Generates .lpl playlist files for RetroArch
 */

const path = require('path');
const crypto = require('crypto');

/**
 * Platform to RetroArch Core Mapping
 */
const PLATFORM_CORE_MAP = {
  // Nintendo
  'nes': {
    corePath: ':/Frameworks/nestopia_libretro.framework',
    coreName: 'Nintendo - NES / Famicom (Nestopia UE)',
    dbName: 'Nintendo - Nintendo Entertainment System.lpl'
  },
  'snes': {
    corePath: ':/Frameworks/snes9x_libretro.framework',
    coreName: 'Nintendo - SNES / SFC (Snes9x)',
    dbName: 'Nintendo - Super Nintendo Entertainment System.lpl'
  },
  'n64': {
    corePath: ':/Frameworks/mupen64plus_next_libretro.framework',
    coreName: 'Nintendo - Nintendo 64 (Mupen64Plus-Next)',
    dbName: 'Nintendo - Nintendo 64.lpl'
  },
  'gba': {
    corePath: ':/Frameworks/mgba_libretro.framework',
    coreName: 'Nintendo - Game Boy Advance (mGBA)',
    dbName: 'Nintendo - Game Boy Advance.lpl'
  },
  'gbc': {
    corePath: ':/Frameworks/gambatte_libretro.framework',
    coreName: 'Nintendo - Game Boy Color (Gambatte)',
    dbName: 'Nintendo - Game Boy Color.lpl'
  },
  'gb': {
    corePath: ':/Frameworks/gambatte_libretro.framework',
    coreName: 'Nintendo - Game Boy (Gambatte)',
    dbName: 'Nintendo - Game Boy.lpl'
  },
  'nds': {
    corePath: ':/Frameworks/desmume_libretro.framework',
    coreName: 'Nintendo - Nintendo DS (DeSmuME)',
    dbName: 'Nintendo - Nintendo DS.lpl'
  },
  'gamecube': {
    corePath: ':/Frameworks/dolphin_libretro.framework',
    coreName: 'Nintendo - GameCube (Dolphin)',
    dbName: 'Nintendo - GameCube.lpl'
  },

  // Sega
  'genesis': {
    corePath: ':/Frameworks/genesis_plus_gx_libretro.framework',
    coreName: 'Sega - Mega Drive - Genesis (Genesis Plus GX)',
    dbName: 'Sega - Mega Drive - Genesis.lpl'
  },
  'mastersystem': {
    corePath: ':/Frameworks/genesis_plus_gx_libretro.framework',
    coreName: 'Sega - Master System - Mark III (Genesis Plus GX)',
    dbName: 'Sega - Master System - Mark III.lpl'
  },
  'gamegear': {
    corePath: ':/Frameworks/genesis_plus_gx_libretro.framework',
    coreName: 'Sega - Game Gear (Genesis Plus GX)',
    dbName: 'Sega - Game Gear.lpl'
  },
  'dreamcast': {
    corePath: ':/Frameworks/flycast_libretro.framework',
    coreName: 'Sega - Dreamcast (Flycast)',
    dbName: 'Sega - Dreamcast.lpl'
  },
  'saturn': {
    corePath: ':/Frameworks/mednafen_saturn_libretro.framework',
    coreName: 'Sega - Saturn (Beetle Saturn)',
    dbName: 'Sega - Saturn.lpl'
  },

  // Sony
  'ps1': {
    corePath: ':/Frameworks/mednafen_psx_hw_libretro.framework',
    coreName: 'Sony - PlayStation (Beetle PSX HW)',
    dbName: 'Sony - PlayStation.lpl'
  },
  'ps2': {
    corePath: ':/Frameworks/pcsx2_libretro.framework',
    coreName: 'Sony - PlayStation 2 (PCSX2)',
    dbName: 'Sony - PlayStation 2.lpl'
  },
  'psp': {
    corePath: ':/Frameworks/ppsspp_libretro.framework',
    coreName: 'Sony - PlayStation Portable (PPSSPP)',
    dbName: 'Sony - PlayStation Portable.lpl'
  },

  // Arcade
  'arcade': {
    corePath: ':/Frameworks/mame_libretro.framework',
    coreName: 'MAME',
    dbName: 'MAME.lpl'
  },
  'neogeo': {
    corePath: ':/Frameworks/fbneo_libretro.framework',
    coreName: 'SNK - Neo Geo (FinalBurn Neo)',
    dbName: 'SNK - Neo Geo.lpl'
  },
  'cps1': {
    corePath: ':/Frameworks/fbneo_libretro.framework',
    coreName: 'Capcom - CPS-1 (FinalBurn Neo)',
    dbName: 'Capcom - CPS-1.lpl'
  },
  'cps2': {
    corePath: ':/Frameworks/fbneo_libretro.framework',
    coreName: 'Capcom - CPS-2 (FinalBurn Neo)',
    dbName: 'Capcom - CPS-2.lpl'
  },

  // Atari
  'atari2600': {
    corePath: ':/Frameworks/stella_libretro.framework',
    coreName: 'Atari - 2600 (Stella)',
    dbName: 'Atari - 2600.lpl'
  },
  'atari7800': {
    corePath: ':/Frameworks/prosystem_libretro.framework',
    coreName: 'Atari - 7800 (ProSystem)',
    dbName: 'Atari - 7800.lpl'
  },

  // Other
  'gw': {
    corePath: ':/Frameworks/gw_libretro.framework',
    coreName: 'Nintendo - Game & Watch (gw)',
    dbName: 'Nintendo - Game & Watch.lpl'
  }
};

/**
 * Get core name (directory) from platform short name
 * @param {string} platformShortName - Platform short name (e.g., 'snes')
 * @returns {string}
 */
function getCoreName(platformShortName) {
  const mapping = {
    'snes': 'snes9x',
    'nes': 'nestopia',
    'n64': 'mupen64plus_next',
    'gba': 'mgba',
    'gbc': 'gambatte',
    'gb': 'gambatte',
    'nds': 'desmume',
    'genesis': 'genesis_plus_gx',
    'mastersystem': 'genesis_plus_gx',
    'gamegear': 'genesis_plus_gx',
    'ps1': 'mednafen_psx_hw',
    'ps2': 'pcsx2',
    'psp': 'ppsspp',
    'arcade': 'mame',
    'neogeo': 'fbneo',
    'cps1': 'fbneo',
    'cps2': 'fbneo',
    'dreamcast': 'flycast',
    'saturn': 'mednafen_saturn',
    'gamecube': 'dolphin',
    'atari2600': 'stella',
    'atari7800': 'prosystem',
    'gw': 'gw'
  };

  return mapping[platformShortName.toLowerCase()] || 'unknown';
}

/**
 * Calculate CRC32 hash for file
 * @param {Buffer} buffer - File buffer
 * @returns {string}
 */
function calculateCRC32(buffer) {
  // Simple CRC32 calculation
  const crc32 = require('buffer-crc32');
  return crc32.unsigned(buffer).toString(16).toUpperCase().padStart(8, '0');
}

/**
 * Generate playlist entry for a ROM
 * @param {Object} rom - ROM object from database
 * @param {string} platformShortName - Platform short name
 * @param {Buffer} fileBuffer - ROM file buffer for CRC32 (optional)
 * @returns {Object}
 */
function generatePlaylistEntry(rom, platformShortName, fileBuffer = null) {
  const platformConfig = PLATFORM_CORE_MAP[platformShortName.toLowerCase()];

  if (!platformConfig) {
    throw new Error(`Unknown platform: ${platformShortName}`);
  }

  // Calculate CRC32 if buffer provided
  let crc32 = 'DETECT';
  if (fileBuffer) {
    crc32 = calculateCRC32(fileBuffer);
  }

  return {
    path: `~/Library/Caches/RetroArch/downloads/${rom.file_name}`,
    label: rom.title || rom.file_name.replace(/\.[^/.]+$/, ''),
    core_path: platformConfig.corePath,
    core_name: platformConfig.coreName,
    crc32: `${crc32}|crc`,
    db_name: platformConfig.dbName
  };
}

/**
 * Generate complete playlist for a platform
 * @param {string} platformShortName - Platform short name (e.g., 'snes')
 * @param {Array<Object>} roms - Array of ROM objects
 * @returns {Object}
 */
function generatePlaylist(platformShortName, roms) {
  const platformConfig = PLATFORM_CORE_MAP[platformShortName.toLowerCase()];

  if (!platformConfig) {
    throw new Error(`Unknown platform: ${platformShortName}`);
  }

  const items = roms.map(rom => generatePlaylistEntry(rom, platformShortName));

  return {
    version: '1.5',
    default_core_path: platformConfig.corePath,
    default_core_name: platformConfig.coreName,
    label_display_mode: 0,
    right_thumbnail_mode: 0,
    left_thumbnail_mode: 0,
    sort_mode: 0,
    items: items
  };
}

/**
 * Get playlist filename for platform
 * @param {string} platformName - Full platform name
 * @returns {string}
 */
function getPlaylistFilename(platformName) {
  // Map platform names to RetroArch playlist filenames
  const filenameMap = {
    'Nintendo Entertainment System': 'Nintendo - Nintendo Entertainment System.lpl',
    'Super Nintendo Entertainment System': 'Nintendo - Super Nintendo Entertainment System.lpl',
    'Nintendo 64': 'Nintendo - Nintendo 64.lpl',
    'Game Boy Advance': 'Nintendo - Game Boy Advance.lpl',
    'Game Boy Color': 'Nintendo - Game Boy Color.lpl',
    'Game Boy': 'Nintendo - Game Boy.lpl',
    'Nintendo DS': 'Nintendo - Nintendo DS.lpl',
    'GameCube': 'Nintendo - GameCube.lpl',
    'Sega Genesis': 'Sega - Mega Drive - Genesis.lpl',
    'Sega Master System': 'Sega - Master System - Mark III.lpl',
    'Sega Game Gear': 'Sega - Game Gear.lpl',
    'Sega Dreamcast': 'Sega - Dreamcast.lpl',
    'Sega Saturn': 'Sega - Saturn.lpl',
    'PlayStation': 'Sony - PlayStation.lpl',
    'PlayStation 2': 'Sony - PlayStation 2.lpl',
    'PlayStation Portable': 'Sony - PlayStation Portable.lpl',
    'Arcade': 'MAME.lpl',
    'Neo Geo': 'SNK - Neo Geo.lpl',
    'CPS-1': 'Capcom - CPS-1.lpl',
    'CPS-2': 'Capcom - CPS-2.lpl',
    'Atari 2600': 'Atari - 2600.lpl',
    'Atari 7800': 'Atari - 7800.lpl',
    'Game & Watch': 'Nintendo - Game & Watch.lpl'
  };

  return filenameMap[platformName] || `${platformName}.lpl`;
}

module.exports = {
  PLATFORM_CORE_MAP,
  getCoreName,
  calculateCRC32,
  generatePlaylistEntry,
  generatePlaylist,
  getPlaylistFilename
};
