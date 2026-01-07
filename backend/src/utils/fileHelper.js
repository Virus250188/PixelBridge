/**
 * File Helper Utility
 * File operations, hashing, and validation
 */

const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

/**
 * Calculate MD5 hash of a file
 * @param {string} filePath - Path to the file
 * @returns {Promise<string>} - MD5 hash
 */
function calculateFileHash(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('md5');
    const stream = fs.createReadStream(filePath);

    stream.on('data', (data) => {
      hash.update(data);
    });

    stream.on('end', () => {
      resolve(hash.digest('hex'));
    });

    stream.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Get file size in bytes
 * @param {string} filePath - Path to the file
 * @returns {number} - File size in bytes
 */
function getFileSize(filePath) {
  const stats = fs.statSync(filePath);
  return stats.size;
}

/**
 * Format file size to human-readable format
 * @param {number} bytes - Size in bytes
 * @returns {string} - Formatted size
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Sanitize filename (remove special characters)
 * @param {string} filename - Original filename
 * @returns {string} - Sanitized filename
 */
function sanitizeFilename(filename) {
  // Get extension
  const ext = path.extname(filename);
  const basename = path.basename(filename, ext);

  // Remove special characters, keep alphanumeric, spaces, hyphens, underscores
  const sanitized = basename
    .replace(/[^a-zA-Z0-9\s\-_]/g, '_')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .substring(0, 200); // Limit length

  return sanitized + ext.toLowerCase();
}

/**
 * Generate unique filename to avoid collisions
 * @param {string} directory - Target directory
 * @param {string} filename - Desired filename
 * @returns {string} - Unique filename
 */
function generateUniqueFilename(directory, filename) {
  const ext = path.extname(filename);
  const basename = path.basename(filename, ext);
  let uniqueName = filename;
  let counter = 1;

  while (fs.existsSync(path.join(directory, uniqueName))) {
    uniqueName = `${basename}_${counter}${ext}`;
    counter++;
  }

  return uniqueName;
}

/**
 * Ensure directory exists, create if not
 * @param {string} dirPath - Directory path
 */
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Delete file safely (ignore if doesn't exist)
 * @param {string} filePath - File path
 */
function deleteFileSafe(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
}

/**
 * Move file from source to destination
 * @param {string} source - Source path
 * @param {string} destination - Destination path
 */
function moveFile(source, destination) {
  ensureDirectoryExists(path.dirname(destination));
  fs.renameSync(source, destination);
}

/**
 * Copy file from source to destination
 * @param {string} source - Source path
 * @param {string} destination - Destination path
 */
function copyFile(source, destination) {
  ensureDirectoryExists(path.dirname(destination));
  fs.copyFileSync(source, destination);
}

/**
 * Extract filename without extension
 * @param {string} filename - Full filename
 * @returns {string} - Filename without extension
 */
function getFilenameWithoutExtension(filename) {
  return path.basename(filename, path.extname(filename));
}

/**
 * Get clean ROM title from filename
 * @param {string} filename - ROM filename
 * @returns {string} - Clean title
 */
function getRomTitleFromFilename(filename) {
  let title = getFilenameWithoutExtension(filename);

  // Remove common suffixes/patterns
  title = title
    .replace(/\([^)]*\)/g, '') // Remove parentheses content (USA), (Europe), etc.
    .replace(/\[[^\]]*\]/g, '') // Remove brackets content [!], [h1], etc.
    .replace(/_/g, ' ')          // Replace underscores with spaces
    .replace(/\s+/g, ' ')        // Normalize spaces
    .trim();

  // Capitalize first letter of each word
  title = title.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

  return title || filename;
}

module.exports = {
  calculateFileHash,
  getFileSize,
  formatFileSize,
  sanitizeFilename,
  generateUniqueFilename,
  ensureDirectoryExists,
  deleteFileSafe,
  moveFile,
  copyFile,
  getFilenameWithoutExtension,
  getRomTitleFromFilename
};
