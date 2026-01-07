/**
 * Cleanup Service
 * Removes orphaned files (covers without associated ROMs)
 */

const fs = require('fs').promises;
const path = require('path');
const config = require('../config/env');
const Rom = require('../models/Rom');

/**
 * Get all cover filenames that are referenced in the database
 */
async function getReferencedCovers() {
  return new Promise((resolve, reject) => {
    Rom.getAll({}, (err, roms) => {
      if (err) return reject(err);

      const referencedCovers = new Set();
      roms.forEach(rom => {
        if (rom.cover_image_path) {
          const filename = path.basename(rom.cover_image_path);
          referencedCovers.add(filename);
        }
      });

      resolve(referencedCovers);
    });
  });
}

/**
 * Clean up orphaned cover files
 * Returns { deleted: number, errors: string[] }
 */
async function cleanupOrphanedCovers() {
  const result = {
    deleted: 0,
    errors: []
  };

  try {
    // Get all covers in filesystem
    const files = await fs.readdir(config.COVERS_PATH);

    // Get all covers referenced in database
    const referencedCovers = await getReferencedCovers();

    // Find orphaned covers (exist in filesystem but not in database)
    const orphanedCovers = files.filter(file => {
      // Only check image files
      const ext = path.extname(file).toLowerCase();
      if (!['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
        return false;
      }

      return !referencedCovers.has(file);
    });

    console.log(`Found ${orphanedCovers.length} orphaned cover(s)`);

    // Delete orphaned covers
    for (const filename of orphanedCovers) {
      const filePath = path.join(config.COVERS_PATH, filename);
      try {
        await fs.unlink(filePath);
        console.log(`✓ Deleted orphaned cover: ${filename}`);
        result.deleted++;
      } catch (err) {
        const error = `Failed to delete ${filename}: ${err.message}`;
        console.error(error);
        result.errors.push(error);
      }
    }

  } catch (err) {
    result.errors.push(`Cleanup failed: ${err.message}`);
    console.error('Cleanup service error:', err);
  }

  return result;
}

/**
 * Clean up orphaned ROM files
 * Returns { deleted: number, errors: string[] }
 */
async function cleanupOrphanedRoms() {
  const result = {
    deleted: 0,
    errors: []
  };

  try {
    // Get all ROMs from database with their file paths
    const roms = await new Promise((resolve, reject) => {
      Rom.getAll({}, (err, roms) => {
        if (err) return reject(err);
        resolve(roms);
      });
    });

    const referencedRomFiles = new Set(
      roms.map(rom => rom.file_path).filter(Boolean)
    );

    // Scan all platform directories
    const platforms = await fs.readdir(config.ROMS_PATH);

    for (const platform of platforms) {
      const platformPath = path.join(config.ROMS_PATH, platform);
      const stats = await fs.stat(platformPath);

      if (!stats.isDirectory()) continue;

      const romFiles = await fs.readdir(platformPath);

      for (const romFile of romFiles) {
        const fullPath = path.join(platformPath, romFile);

        // Check if this ROM file is referenced in database
        if (!referencedRomFiles.has(fullPath)) {
          try {
            await fs.unlink(fullPath);
            console.log(`✓ Deleted orphaned ROM: ${platform}/${romFile}`);
            result.deleted++;
          } catch (err) {
            const error = `Failed to delete ${platform}/${romFile}: ${err.message}`;
            console.error(error);
            result.errors.push(error);
          }
        }
      }
    }

  } catch (err) {
    result.errors.push(`ROM cleanup failed: ${err.message}`);
    console.error('ROM cleanup error:', err);
  }

  return result;
}

/**
 * Run full cleanup (covers + ROMs)
 */
async function runFullCleanup() {
  console.log('Starting cleanup service...');

  const coverResult = await cleanupOrphanedCovers();
  const romResult = await cleanupOrphanedRoms();

  const totalResult = {
    covers: coverResult,
    roms: romResult,
    total_deleted: coverResult.deleted + romResult.deleted,
    total_errors: coverResult.errors.length + romResult.errors.length
  };

  console.log(`Cleanup complete: ${totalResult.total_deleted} files deleted, ${totalResult.total_errors} errors`);

  return totalResult;
}

module.exports = {
  cleanupOrphanedCovers,
  cleanupOrphanedRoms,
  runFullCleanup
};
