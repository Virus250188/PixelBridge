/**
 * Platform Detector Utility
 * Auto-detect gaming platform from file extension
 */

const path = require('path');
const { PLATFORM_EXTENSIONS } = require('../config/constants');
const Platform = require('../models/Platform');

/**
 * Detect platform from file extension
 * @param {string} filename - The ROM filename
 * @returns {Promise<object|null>} - Platform object or null
 */
function detectPlatformFromFilename(filename, callback) {
  const ext = path.extname(filename).toLowerCase();

  // Find matching platform by extension
  for (const [shortName, extensions] of Object.entries(PLATFORM_EXTENSIONS)) {
    if (extensions.includes(ext)) {
      // Get platform from database
      Platform.getByShortName(shortName, (err, platform) => {
        if (err) {
          callback(err, null);
          return;
        }
        callback(null, platform);
      });
      return;
    }
  }

  // No matching platform found
  callback(null, null);
}

/**
 * Get platform short name from extension (synchronous)
 * @param {string} filename - The ROM filename
 * @returns {string|null} - Platform short name or null
 */
function getPlatformShortNameFromExtension(filename) {
  const ext = path.extname(filename).toLowerCase();

  for (const [shortName, extensions] of Object.entries(PLATFORM_EXTENSIONS)) {
    if (extensions.includes(ext)) {
      return shortName;
    }
  }

  return null;
}

/**
 * Check if file extension is supported
 * @param {string} filename - The filename to check
 * @returns {boolean} - True if supported
 */
function isSupportedExtension(filename) {
  const ext = path.extname(filename).toLowerCase();

  // Special case: .zip is always supported (will be extracted)
  if (ext === '.zip' || ext === '.7z') {
    return true;
  }

  // Check if extension exists in any platform
  for (const extensions of Object.values(PLATFORM_EXTENSIONS)) {
    if (extensions.includes(ext)) {
      return true;
    }
  }

  return false;
}

/**
 * Get friendly platform name from short name
 * @param {string} shortName - Platform short name (e.g., 'nes')
 * @returns {string} - Friendly name
 */
function getPlatformDisplayName(shortName) {
  const nameMap = {
    nes: 'NES',
    snes: 'SNES',
    n64: 'N64',
    gb: 'Game Boy',
    gba: 'GBA',
    nds: 'Nintendo DS',
    psx: 'PlayStation',
    psp: 'PSP',
    genesis: 'Genesis',
    sms: 'Master System',
    gamegear: 'Game Gear',
    saturn: 'Saturn',
    dreamcast: 'Dreamcast',
    atari2600: 'Atari 2600',
    atari7800: 'Atari 7800',
    lynx: 'Atari Lynx',
    neogeo: 'Neo Geo',
    ngp: 'Neo Geo Pocket',
    pcengine: 'TurboGrafx-16',
    wonderswan: 'WonderSwan',
    virtualboy: 'Virtual Boy',
    mame: 'MAME',
    fbneo: 'FinalBurn Neo'
  };

  return nameMap[shortName] || shortName.toUpperCase();
}

module.exports = {
  detectPlatformFromFilename,
  getPlatformShortNameFromExtension,
  isSupportedExtension,
  getPlatformDisplayName
};
