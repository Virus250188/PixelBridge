/**
 * File Service
 * Handles file operations, ZIP extraction, and ROM processing
 */

const fs = require('fs');
const path = require('path');
const extract = require('extract-zip');
const Seven = require('node-7z');
const sevenBin = require('7zip-bin');
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
    // Handle ZIP/7z files
    if (ext === '.zip' || ext === '.7z') {
      console.log(`Extracting archive: ${file.originalname}`);
      extractedFiles = await extractZipFile(file.path);

      if (extractedFiles.length === 0) {
        throw new Error('No ROM files found in archive');
      }

      // Find the main ROM file (priority: .m3u > .cue > .iso > .bin)
      romFile = findMainRomFile(extractedFiles);
      console.log(`Main ROM file: ${romFile.filename} (${extractedFiles.length} total files extracted)`);
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

    // Calculate file hash for duplicate detection (use main ROM file)
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

    let finalPath;
    let uniqueName;

    // Multi-file handling: If archive has multiple files, create a subdirectory
    if (ext === '.zip' || ext === '.7z') {
      if (extractedFiles.length > 1) {
        // Create subdirectory for multi-file ROMs (e.g., PS1 .cue/.bin pairs)
        const gameName = getRomTitleFromFilename(romFile.filename);
        const gameDir = path.join(targetDir, sanitizeFilename(gameName));
        ensureDirectoryExists(gameDir);

        // Move ALL extracted files to the game subdirectory
        for (const extractedFile of extractedFiles) {
          const destPath = path.join(gameDir, sanitizeFilename(extractedFile.filename));
          moveFile(extractedFile.path, destPath);
          console.log(`  Moved: ${extractedFile.filename}`);
        }

        // Update path to the main ROM file
        uniqueName = path.join(sanitizeFilename(gameName), sanitizeFilename(romFile.filename));
        finalPath = path.join(targetDir, uniqueName);
      } else {
        // Single file - move directly
        const sanitizedName = sanitizeFilename(romFile.filename);
        uniqueName = generateUniqueFilename(targetDir, sanitizedName);
        finalPath = path.join(targetDir, uniqueName);
        moveFile(romFile.path, finalPath);
      }

      // Clean up original archive
      deleteFileSafe(file.path);
    } else {
      // Non-archive file - move directly
      const sanitizedName = sanitizeFilename(romFile.filename);
      uniqueName = generateUniqueFilename(targetDir, sanitizedName);
      finalPath = path.join(targetDir, uniqueName);
      moveFile(romFile.path, finalPath);
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
 * Find the main ROM file from extracted files
 * Priority: .m3u > .cue > .iso > .chd > .bin > others
 * @param {Array} files - Array of extracted file objects
 * @returns {object} - Main ROM file object
 */
function findMainRomFile(files) {
  // Priority order for main ROM file detection
  const priorityExtensions = ['.m3u', '.cue', '.iso', '.chd', '.bin'];

  // Try each priority extension
  for (const ext of priorityExtensions) {
    const found = files.find(f => f.filename.toLowerCase().endsWith(ext));
    if (found) {
      return found;
    }
  }

  // If no priority extension found, return the first file
  return files[0];
}

/**
 * Detect actual archive format by reading magic bytes
 * @param {string} filePath - Path to archive file
 * @returns {Promise<string>} - 'zip', '7z', or 'unknown'
 */
async function detectArchiveFormat(filePath) {
  return new Promise((resolve, reject) => {
    const buffer = Buffer.alloc(8);
    const fd = fs.openSync(filePath, 'r');
    try {
      fs.readSync(fd, buffer, 0, 8, 0);
      fs.closeSync(fd);

      // Check for ZIP magic bytes (PK - 0x50 0x4B)
      if (buffer[0] === 0x50 && buffer[1] === 0x4B) {
        resolve('zip');
        return;
      }

      // Check for 7z magic bytes (37 7A BC AF 27 1C)
      if (buffer[0] === 0x37 && buffer[1] === 0x7A &&
          buffer[2] === 0xBC && buffer[3] === 0xAF &&
          buffer[4] === 0x27 && buffer[5] === 0x1C) {
        resolve('7z');
        return;
      }

      resolve('unknown');
    } catch (err) {
      fs.closeSync(fd);
      reject(err);
    }
  });
}

/**
 * Get path to 7z binary
 * Prefers system binary (Docker/Linux) over bundled binary
 * @returns {string} - Path to 7z binary
 */
function get7zaPath() {
  // Check for system 7z binaries (Alpine uses /usr/bin/7z or /usr/bin/7zz)
  const systemPaths = ['/usr/bin/7z', '/usr/bin/7zz', '/usr/bin/7za', '/usr/local/bin/7za'];
  for (const p of systemPaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }
  // Fall back to bundled binary (for local development)
  return sevenBin.path7za;
}

/**
 * Extract 7z file using node-7z
 * @param {string} archivePath - Path to 7z file
 * @param {string} extractDir - Directory to extract to
 * @returns {Promise<void>}
 */
async function extract7z(archivePath, extractDir) {
  return new Promise((resolve, reject) => {
    const pathTo7zip = get7zaPath();
    console.log(`Using 7za binary: ${pathTo7zip}`);
    const seven = Seven.extractFull(archivePath, extractDir, {
      $bin: pathTo7zip,
      recursive: true
    });

    seven.on('end', () => resolve());
    seven.on('error', (err) => reject(err));
  });
}

/**
 * Extract archive file (ZIP or 7z) and return ROM files
 * @param {string} archivePath - Path to archive file
 * @returns {Promise<Array>} - Array of extracted ROM file objects
 */
async function extractZipFile(archivePath) {
  const extractDir = path.join(path.dirname(archivePath), `extract_${Date.now()}`);
  ensureDirectoryExists(extractDir);

  try {
    // Detect actual format by magic bytes (not extension!)
    const format = await detectArchiveFormat(archivePath);
    console.log(`Detected archive format: ${format} for file: ${path.basename(archivePath)}`);

    if (format === '7z') {
      // Extract 7z
      await extract7z(archivePath, extractDir);
    } else if (format === 'zip') {
      // Extract ZIP
      await extract(archivePath, { dir: extractDir });
    } else {
      throw new Error(`Unsupported archive format. File appears to be neither ZIP nor 7z.`);
    }

    // Find ROM files and related files in extracted directory
    const files = fs.readdirSync(extractDir, { recursive: true });
    const romFiles = [];

    // Extensions to include (ROMs + related files like .cue, .m3u, .sub, etc.)
    const relatedExtensions = ['.cue', '.m3u', '.sub', '.sbi', '.img', '.mds', '.mdf', '.pbp', '.ecm'];

    for (const file of files) {
      const fullPath = path.join(extractDir, file);
      const stats = fs.statSync(fullPath);

      if (stats.isFile()) {
        const ext = path.extname(file).toLowerCase();

        // Skip nested archives
        if (ext === '.zip' || ext === '.7z' || ext === '.rar') {
          continue;
        }

        // Include supported ROM extensions OR related file extensions
        if (isSupportedExtension(file) || relatedExtensions.includes(ext)) {
          romFiles.push({
            filename: path.basename(file),
            path: fullPath
          });
        }
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
