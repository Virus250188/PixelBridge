/**
 * Startup Sync Service
 * Synchronizes ROMs and covers from filesystem to database on container startup
 * This fixes persistence issues when database is lost but files remain
 */

const fs = require('fs');
const path = require('path');
const Rom = require('../models/Rom');
const Platform = require('../models/Platform');
const config = require('../config/env');
const { calculateFileHash, getFileSize, getRomTitleFromFilename } = require('../utils/fileHelper');
const { detectPlatformFromFilename } = require('../utils/platformDetector');

/**
 * Scan filesystem and sync ROMs to database
 */
async function syncRomsFromFilesystem() {
  console.log('\n🔄 Starting ROM filesystem sync...');
  
  const romsPath = config.ROMS_PATH;
  
  if (!fs.existsSync(romsPath)) {
    console.log('⚠️  ROMs directory does not exist:', romsPath);
    return { synced: 0, skipped: 0, errors: 0 };
  }

  let synced = 0;
  let skipped = 0;
  let errors = 0;

  try {
    // Get all subdirectories (platforms)
    const platformDirs = fs.readdirSync(romsPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    for (const platformDir of platformDirs) {
      const platformPath = path.join(romsPath, platformDir);
      console.log(`  Scanning platform: ${platformDir}`);

      // Get all ROM files in this platform directory
      const files = fs.readdirSync(platformPath, { withFileTypes: true })
        .filter(dirent => dirent.isFile())
        .map(dirent => dirent.name);

      for (const file of files) {
        const filePath = path.join(platformPath, file);
        
        try {
          // Calculate file hash
          const fileHash = await calculateFileHash(filePath);

          // Check if ROM already exists in database
          const existing = await new Promise((resolve, reject) => {
            Rom.existsByHash(fileHash, (err, result) => {
              if (err) reject(err);
              else resolve(result);
            });
          });

          if (existing) {
            skipped++;
            continue;
          }

          // Detect platform
          const platform = await new Promise((resolve, reject) => {
            detectPlatformFromFilename(file, (err, result) => {
              if (err) reject(err);
              else resolve(result);
            });
          });

          if (!platform) {
            console.log(`    ⚠️  Could not detect platform for: ${file}`);
            errors++;
            continue;
          }

          // Check if cover exists
          const coverPattern = `rom_\\d+_cover\\.(jpg|png)`;
          const coversPath = config.COVERS_PATH;
          let coverImagePath = null;

          if (fs.existsSync(coversPath)) {
            const covers = fs.readdirSync(coversPath);
            // Try to find a cover that might belong to this ROM
            // This is a best-effort approach - ideally covers should be named after ROM hash or ID
            const possibleCovers = covers.filter(c => /^rom_\d+_cover\.(jpg|png)$/i.test(c));
            if (possibleCovers.length > 0) {
              // For now, we can't definitively link covers without metadata
              // User may need to re-upload or the system will fetch new ones
            }
          }

          // Create ROM entry
          const romData = {
            title: getRomTitleFromFilename(file),
            platform_id: platform.id,
            file_name: file,
            file_path: filePath,
            file_size: getFileSize(filePath),
            file_hash: fileHash,
            cover_image_path: coverImagePath
          };

          await new Promise((resolve, reject) => {
            Rom.create(romData, (err, result) => {
              if (err) reject(err);
              else resolve(result);
            });
          });

          console.log(`    ✓ Synced: ${file} → ${platform.short_name}`);
          synced++;

        } catch (error) {
          console.log(`    ✗ Error syncing ${file}:`, error.message);
          errors++;
        }
      }
    }

    console.log(`\n✓ ROM sync complete: ${synced} synced, ${skipped} skipped, ${errors} errors\n`);
    return { synced, skipped, errors };

  } catch (error) {
    console.error('✗ ROM sync failed:', error);
    return { synced, skipped, errors };
  }
}

/**
 * Sync covers from filesystem
 * Links existing cover files to ROMs in database
 */
async function syncCoversFromFilesystem() {
  console.log('🖼️  Syncing covers from filesystem...');
  
  const coversPath = config.COVERS_PATH;
  
  if (!fs.existsSync(coversPath)) {
    console.log('⚠️  Covers directory does not exist:', coversPath);
    return { synced: 0, errors: 0 };
  }

  let synced = 0;
  let errors = 0;

  try {
    const coverFiles = fs.readdirSync(coversPath)
      .filter(file => /\.(jpg|jpeg|png)$/i.test(file));

    for (const coverFile of coverFiles) {
      const coverPath = path.join(coversPath, coverFile);
      
      // Extract ROM ID from cover filename (e.g., rom_1_cover.jpg → 1)
      const match = coverFile.match(/^rom_(\d+)_cover\./);
      if (!match) {
        continue; // Skip files that don't match the naming pattern
      }

      const romId = parseInt(match[1]);

      try {
        // Get ROM from database
        const rom = await new Promise((resolve, reject) => {
          Rom.getById(romId, (err, result) => {
            if (err) reject(err);
            else resolve(result);
          });
        });

        if (!rom) {
          // ROM doesn't exist in database - cover is orphaned
          continue;
        }

        // Update ROM with cover path if not already set
        if (!rom.cover_image_path || rom.cover_image_path !== coverPath) {
          await new Promise((resolve, reject) => {
            Rom.update(romId, { ...rom, cover_image_path: coverPath }, (err, result) => {
              if (err) reject(err);
              else resolve(result);
            });
          });

          console.log(`  ✓ Linked cover to ROM #${romId}: ${coverFile}`);
          synced++;
        }

      } catch (error) {
        console.log(`  ✗ Error syncing cover ${coverFile}:`, error.message);
        errors++;
      }
    }

    console.log(`✓ Cover sync complete: ${synced} linked, ${errors} errors\n`);
    return { synced, errors };

  } catch (error) {
    console.error('✗ Cover sync failed:', error);
    return { synced, errors };
  }
}

/**
 * Run full startup sync
 */
async function runStartupSync() {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  Startup Filesystem Sync');
  console.log('═══════════════════════════════════════════════════════');
  
  // Sync ROMs first
  const romResults = await syncRomsFromFilesystem();
  
  // Then sync covers
  const coverResults = await syncCoversFromFilesystem();
  
  console.log('═══════════════════════════════════════════════════════');
  console.log(`  Summary: ${romResults.synced} ROMs synced, ${coverResults.synced} covers linked`);
  console.log('═══════════════════════════════════════════════════════\n');
  
  return {
    roms: romResults,
    covers: coverResults
  };
}

module.exports = {
  runStartupSync,
  syncRomsFromFilesystem,
  syncCoversFromFilesystem
};
