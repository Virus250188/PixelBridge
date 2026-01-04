/**
 * File Service
 * Handles file operations, ZIP extraction, and ROM processing
 */

const fs = require('fs');
const path = require('path');
const extract = require('extract-zip');
const {
  calculateFileHash,
  getFileSize,
  sanitizeFilename,
  generateUniqueFilename,
  ensureDirectoryExists,
  deleteFileSafe,
  moveFile,
  getRomTitleFromFilename
} = require('../utils/fileHelper');
const {
  detectPlatformFromFilename,
  getPlatformShortNameFromExtension,
  isSupportedExtension
} = require('../utils/platformDetector');
const Rom = require('../models/Rom');
const config = require('../config/env');

/**
 * Process uploaded file (extract ZIP if needed, move to final location)
 * @param {object} file - Multer file object
 * @param {number} platformId - Platform ID (optional, will auto-detect if not provided)
 * @returns {Promise<object>} - Processed ROM data
 */
async function processUploadedFile(file, platformId = null) {
  const ext = path.extname(file.originalname).toLowerCase();
  let romFile = file;
  let extractedFiles = [];

  try {
    // Handle ZIP files
    if (ext === '.zip' || ext === '.7z') {
      console.log(`Extracting ZIP file: ${file.originalname}`);
      extractedFiles = await extractZipFile(file.path);

      if (extractedFiles.length === 0) {
        throw new Error('No ROM files found in ZIP archive');
      }

      // Use first ROM file found
      romFile = extractedFiles[0];
      console.log(`Extracted ROM: ${romFile.filename}`);
    }

    // Detect platform if not provided
    let platform = null;
    if (!platformId) {
      platform = await new Promise((resolve, reject) => {
        detectPlatformFromFilename(romFile.filename, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });

      if (!platform) {
        throw new Error(`Could not detect platform for file: ${romFile.filename}`);
      }

      platformId = platform.id;
    }

    // Calculate file hash for duplicate detection
    const fileHash = await calculateFileHash(romFile.path);

    // Check for duplicates
    const existingRom = await new Promise((resolve, reject) => {
      Rom.existsByHash(fileHash, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    if (existingRom) {
      // Clean up temporary files
      deleteFileSafe(file.path);
      if (ext === '.zip' || ext === '.7z') {
        extractedFiles.forEach(f => deleteFileSafe(f.path));
      }

      throw new Error(`ROM already exists in library: ${existingRom.title}`);
    }

    // Move ROM to final storage location
    const platformShortName = getPlatformShortNameFromExtension(romFile.filename);
    const targetDir = path.join(config.ROMS_PATH, platformShortName || 'unknown');
    ensureDirectoryExists(targetDir);

    const sanitizedName = sanitizeFilename(romFile.filename);
    const uniqueName = generateUniqueFilename(targetDir, sanitizedName);
    const finalPath = path.join(targetDir, uniqueName);

    moveFile(romFile.path, finalPath);

    // Clean up original ZIP if it was extracted
    if (ext === '.zip' || ext === '.7z') {
      deleteFileSafe(file.path);
      // Clean up other extracted files (we only keep the first ROM)
      extractedFiles.slice(1).forEach(f => deleteFileSafe(f.path));
    }

    // Prepare ROM data
    const romData = {
      title: getRomTitleFromFilename(romFile.filename),
      platform_id: platformId,
      file_name: uniqueName,
      file_path: finalPath,
      file_size: getFileSize(finalPath),
      file_hash: fileHash
    };

    return romData;

  } catch (error) {
    // Clean up on error
    deleteFileSafe(file.path);
    if (romFile && romFile.path !== file.path) {
      deleteFileSafe(romFile.path);
    }
    extractedFiles.forEach(f => deleteFileSafe(f.path));

    throw error;
  }
}

/**
 * Extract ZIP file and return ROM files
 * @param {string} zipPath - Path to ZIP file
 * @returns {Promise<Array>} - Array of extracted ROM file objects
 */
async function extractZipFile(zipPath) {
  const extractDir = path.join(path.dirname(zipPath), `extract_${Date.now()}`);
  ensureDirectoryExists(extractDir);

  try {
    // Extract ZIP
    await extract(zipPath, { dir: extractDir });

    // Find ROM files in extracted directory
    const files = fs.readdirSync(extractDir, { recursive: true });
    const romFiles = [];

    for (const file of files) {
      const fullPath = path.join(extractDir, file);
      const stats = fs.statSync(fullPath);

      if (stats.isFile() && isSupportedExtension(file)) {
        const ext = path.extname(file).toLowerCase();

        // Skip nested ZIPs
        if (ext === '.zip' || ext === '.7z') {
          continue;
        }

        romFiles.push({
          filename: path.basename(file),
          path: fullPath
        });
      }
    }

    return romFiles;

  } catch (error) {
    // Clean up extraction directory on error
    if (fs.existsSync(extractDir)) {
      fs.rmSync(extractDir, { recursive: true, force: true });
    }
    throw new Error(`Failed to extract ZIP: ${error.message}`);
  }
}

/**
 * Delete ROM file and related data
 * @param {object} rom - ROM object from database
 * @returns {Promise<void>}
 */
async function deleteRomFile(rom) {
  // Delete ROM file
  deleteFileSafe(rom.file_path);

  // Delete cover image if exists
  if (rom.cover_image_path) {
    deleteFileSafe(rom.cover_image_path);
  }

  // Delete screenshot if exists
  if (rom.screenshot_path) {
    deleteFileSafe(rom.screenshot_path);
  }
}

/**
 * Get storage statistics
 * @returns {object} - Storage stats
 */
function getStorageStats() {
  const romsPath = config.ROMS_PATH;
  let totalSize = 0;
  let fileCount = 0;

  function calculateDirSize(dirPath) {
    if (!fs.existsSync(dirPath)) return;

    const files = fs.readdirSync(dirPath);

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);

      if (stats.isDirectory()) {
        calculateDirSize(filePath);
      } else {
        totalSize += stats.size;
        fileCount++;
      }
    }
  }

  calculateDirSize(romsPath);

  return {
    totalSize,
    fileCount,
    totalSizeFormatted: formatBytes(totalSize)
  };
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

module.exports = {
  processUploadedFile,
  extractZipFile,
  deleteRomFile,
  getStorageStats
};
