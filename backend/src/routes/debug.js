/**
 * Debug Routes
 * Diagnostic endpoints to troubleshoot configuration issues
 */

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const config = require('../config/env');

/**
 * GET /api/debug/config
 * Shows all configuration values
 */
router.get('/config', (req, res) => {
  res.json({
    config: {
      NODE_ENV: config.NODE_ENV,
      PORT: config.PORT,
      STORAGE_PATH: config.STORAGE_PATH,
      DATABASE_PATH: config.DATABASE_PATH,
      ROMS_PATH: config.ROMS_PATH,
      COVERS_PATH: config.COVERS_PATH,
      METADATA_PATH: config.METADATA_PATH,
      RETROARCH_IP: config.RETROARCH_IP,
      RETROARCH_PORT: config.RETROARCH_PORT,
      IGDB_CLIENT_ID: config.IGDB_CLIENT_ID ? '***SET***' : 'NOT SET',
      IGDB_CLIENT_SECRET: config.IGDB_CLIENT_SECRET ? '***SET***' : 'NOT SET'
    },
    env_raw: {
      STORAGE_PATH: process.env.STORAGE_PATH || 'NOT SET',
      DATABASE_PATH: process.env.DATABASE_PATH || 'NOT SET',
      ROMS_PATH: process.env.ROMS_PATH || 'NOT SET',
      COVERS_PATH: process.env.COVERS_PATH || 'NOT SET',
      METADATA_PATH: process.env.METADATA_PATH || 'NOT SET'
    },
    process: {
      cwd: process.cwd(),
      __dirname: __dirname
    }
  });
});

/**
 * GET /api/debug/filesystem
 * Shows filesystem structure and file checks
 */
router.get('/filesystem', (req, res) => {
  const checks = {};

  // Check if paths exist
  checks.storage_exists = fs.existsSync(config.STORAGE_PATH);
  checks.database_dir_exists = fs.existsSync(path.dirname(config.DATABASE_PATH));
  checks.database_file_exists = fs.existsSync(config.DATABASE_PATH);
  checks.roms_exists = fs.existsSync(config.ROMS_PATH);
  checks.covers_exists = fs.existsSync(config.COVERS_PATH);
  checks.metadata_exists = fs.existsSync(config.METADATA_PATH);

  // List covers directory
  let covers_list = [];
  if (checks.covers_exists) {
    try {
      const files = fs.readdirSync(config.COVERS_PATH);
      covers_list = files.map(file => {
        const fullPath = path.join(config.COVERS_PATH, file);
        const stats = fs.statSync(fullPath);
        return {
          filename: file,
          full_path: fullPath,
          size: stats.size,
          readable: fs.accessSync(fullPath, fs.constants.R_OK) === undefined
        };
      });
    } catch (err) {
      covers_list = [`ERROR: ${err.message}`];
    }
  }

  // List ROMs directory structure
  let roms_structure = {};
  if (checks.roms_exists) {
    try {
      const platforms = fs.readdirSync(config.ROMS_PATH);
      platforms.forEach(platform => {
        const platformPath = path.join(config.ROMS_PATH, platform);
        if (fs.statSync(platformPath).isDirectory()) {
          const roms = fs.readdirSync(platformPath);
          roms_structure[platform] = roms.length;
        }
      });
    } catch (err) {
      roms_structure = { error: err.message };
    }
  }

  res.json({
    paths: {
      STORAGE_PATH: config.STORAGE_PATH,
      COVERS_PATH: config.COVERS_PATH,
      ROMS_PATH: config.ROMS_PATH,
      DATABASE_PATH: config.DATABASE_PATH
    },
    existence_checks: checks,
    covers_directory: {
      total_files: covers_list.length,
      files: covers_list
    },
    roms_directory: {
      platforms: roms_structure
    }
  });
});

/**
 * GET /api/debug/test-cover/:filename
 * Test if a specific cover file can be read
 */
router.get('/test-cover/:filename', (req, res) => {
  const filename = req.params.filename;
  const coverPath = path.join(config.COVERS_PATH, filename);

  const result = {
    requested_filename: filename,
    constructed_path: coverPath,
    covers_base_path: config.COVERS_PATH,
    file_exists: fs.existsSync(coverPath)
  };

  if (result.file_exists) {
    try {
      const stats = fs.statSync(coverPath);
      result.file_stats = {
        size: stats.size,
        mode: stats.mode.toString(8),
        is_file: stats.isFile(),
        is_directory: stats.isDirectory()
      };

      // Try to read file
      try {
        fs.accessSync(coverPath, fs.constants.R_OK);
        result.readable = true;
        result.file_content_preview = 'File is readable (not displaying binary content)';
      } catch (err) {
        result.readable = false;
        result.read_error = err.message;
      }
    } catch (err) {
      result.stat_error = err.message;
    }
  }

  res.json(result);
});

/**
 * GET /api/debug/express-static
 * Test Express static middleware configuration
 */
router.get('/express-static', (req, res) => {
  const app = require('../app');

  res.json({
    message: 'Express static middleware is configured to serve from:',
    covers_path: config.COVERS_PATH,
    expected_url_pattern: '/covers/<filename>',
    test_urls: [
      'http://your-server:1234/covers/rom_1_cover.jpg',
      'http://your-server:3000/covers/rom_1_cover.jpg'
    ],
    note: 'If files exist in COVERS_PATH but return 404, check nginx proxy configuration'
  });
});

/**
 * POST /api/debug/cleanup
 * Clean up orphaned files (covers and ROMs without database entries)
 */
router.post('/cleanup', async (req, res) => {
  try {
    const cleanupService = require('../services/cleanupService');
    const result = await cleanupService.runFullCleanup();
    res.json({
      success: true,
      message: 'Cleanup completed',
      result
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Cleanup failed',
      error: err.message
    });
  }
});

/**
 * GET /api/debug/appletv
 * Check what's currently on the Apple TV (downloads, playlists, saves, states)
 */
router.get('/appletv', async (req, res) => {
  try {
    const retroarchService = require('../services/retroarchService');

    const result = {
      connection: await retroarchService.checkConnection(),
      directories: {
        downloads: { exists: false, files: [], error: null },
        playlists: { exists: false, files: [], error: null },
        saves: { exists: false, cores: {}, error: null },
        states: { exists: false, cores: {}, error: null }
      },
      errors: []
    };

    // Check downloads directory
    try {
      const downloads = await retroarchService.listDirectory('/downloads/');
      result.directories.downloads.exists = true;
      result.directories.downloads.files = downloads.map(f => f.name || f);
    } catch (err) {
      result.directories.downloads.error = err.message;
      result.errors.push(`Downloads: ${err.message}`);
    }

    // Check playlists
    try {
      const playlists = await retroarchService.listDirectory('/playlists/');
      result.directories.playlists.exists = true;
      result.directories.playlists.files = playlists
        .filter(p => p.name && p.name.endsWith('.lpl'))
        .map(p => p.name);
    } catch (err) {
      result.directories.playlists.error = err.message;
      result.errors.push(`Playlists: ${err.message}`);
    }

    // Check saves directory and list cores
    try {
      const saves = await retroarchService.listDirectory('/saves/');
      result.directories.saves.exists = true;
      for (const item of saves) {
        const name = item.name || item;
        if (name && !name.startsWith('.') && (item.path?.endsWith('/') || name.endsWith('/'))) {
          const coreName = name.replace('/', '');
          try {
            const coreFiles = await retroarchService.listDirectory(`/saves/${coreName}/`);
            result.directories.saves.cores[coreName] = coreFiles.map(f => f.name || f);
          } catch (coreErr) {
            result.directories.saves.cores[coreName] = [`Error: ${coreErr.message}`];
          }
        }
      }
    } catch (err) {
      result.directories.saves.error = err.message;
      result.errors.push(`Saves: ${err.message}`);
    }

    // Check states directory and list cores
    try {
      const states = await retroarchService.listDirectory('/states/');
      result.directories.states.exists = true;
      for (const item of states) {
        const name = item.name || item;
        if (name && !name.startsWith('.') && (item.path?.endsWith('/') || name.endsWith('/'))) {
          const coreName = name.replace('/', '');
          try {
            const coreFiles = await retroarchService.listDirectory(`/states/${coreName}/`);
            result.directories.states.cores[coreName] = coreFiles.map(f => f.name || f);
          } catch (coreErr) {
            result.directories.states.cores[coreName] = [`Error: ${coreErr.message}`];
          }
        }
      }
    } catch (err) {
      result.directories.states.error = err.message;
      result.errors.push(`States: ${err.message}`);
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Apple TV check failed',
      error: err.message
    });
  }
});

/**
 * POST /api/debug/appletv/create-directories
 * Manually create critical directories on Apple TV
 */
router.post('/appletv/create-directories', async (req, res) => {
  try {
    const retroarchService = require('../services/retroarchService');
    const results = {
      created: [],
      failed: [],
      alreadyExists: []
    };

    const directories = ['/downloads/', '/playlists/', '/saves/', '/states/'];

    for (const dir of directories) {
      try {
        await retroarchService.createDirectory(dir);
        results.created.push(dir);
      } catch (err) {
        if (err.message?.includes('exists') || err.response?.status === 409) {
          results.alreadyExists.push(dir);
        } else {
          results.failed.push({ dir, error: err.message });
        }
      }
    }

    res.json({
      success: results.failed.length === 0,
      message: 'Directory creation completed',
      results
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to create directories',
      error: err.message
    });
  }
});

/**
 * POST /api/debug/swap-covers
 * Swap two cover files by ROM IDs (useful for fixing incorrectly assigned covers)
 */
router.post('/swap-covers', async (req, res) => {
  try {
    const { rom_id_1, rom_id_2 } = req.body;

    if (!rom_id_1 || !rom_id_2) {
      return res.status(400).json({
        success: false,
        message: 'Both rom_id_1 and rom_id_2 are required'
      });
    }

    const cover1 = path.join(config.COVERS_PATH, `rom_${rom_id_1}_cover.jpg`);
    const cover2 = path.join(config.COVERS_PATH, `rom_${rom_id_2}_cover.jpg`);
    const tempCover = path.join(config.COVERS_PATH, `rom_temp_${Date.now()}.jpg`);

    // Check if both covers exist
    if (!fs.existsSync(cover1)) {
      return res.status(404).json({
        success: false,
        message: `Cover for ROM ${rom_id_1} not found`
      });
    }

    if (!fs.existsSync(cover2)) {
      return res.status(404).json({
        success: false,
        message: `Cover for ROM ${rom_id_2} not found`
      });
    }

    // Swap files using temp file
    fs.renameSync(cover1, tempCover);
    fs.renameSync(cover2, cover1);
    fs.renameSync(tempCover, cover2);

    res.json({
      success: true,
      message: `Successfully swapped covers for ROM ${rom_id_1} and ROM ${rom_id_2}`,
      files_swapped: [
        `rom_${rom_id_1}_cover.jpg`,
        `rom_${rom_id_2}_cover.jpg`
      ]
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to swap covers',
      error: err.message
    });
  }
});

/**
 * POST /api/debug/factory-reset
 * DANGER: Complete factory reset - deletes ALL data (database, ROMs, covers)
 */
router.post('/factory-reset', async (req, res) => {
  try {
    const { confirm } = req.body;

    if (confirm !== 'RESET_PIXELBRIDGE') {
      return res.status(400).json({
        success: false,
        message: 'Factory reset requires confirmation. Send { "confirm": "RESET_PIXELBRIDGE" } in the request body.',
        warning: 'This will DELETE ALL ROMs, covers, and database entries!'
      });
    }

    const Rom = require('../models/Rom');
    const Platform = require('../models/Platform');
    const Settings = require('../models/Settings');
    const { db } = require('../config/database');
    const fsPromises = require('fs').promises;
    const fsSync = require('fs');

    const results = {
      database: { romsDeleted: 0, success: false },
      roms: { filesDeleted: 0, errors: [] },
      covers: { filesDeleted: 0, errors: [] },
      saves: { filesDeleted: 0, errors: [] }
    };

    // 1. Clear database tables
    console.log('🗑️  Factory Reset: Clearing database...');
    try {
      await new Promise((resolve, reject) => {
        db.run('DELETE FROM roms', function(err) {
          if (err) reject(err);
          else {
            results.database.romsDeleted = this.changes;
            resolve();
          }
        });
      });
      results.database.success = true;
      console.log(`✅ Deleted ${results.database.romsDeleted} ROMs from database`);
    } catch (err) {
      results.database.error = err.message;
      console.error('❌ Database clear failed:', err.message);
    }

    // 2. Delete all ROM files
    console.log('🗑️  Factory Reset: Deleting ROM files...');
    try {
      if (fsSync.existsSync(config.ROMS_PATH)) {
        const platforms = await fsPromises.readdir(config.ROMS_PATH);
        for (const platform of platforms) {
          const platformPath = path.join(config.ROMS_PATH, platform);
          const stat = await fsPromises.stat(platformPath);
          if (stat.isDirectory()) {
            const files = await fsPromises.readdir(platformPath);
            for (const file of files) {
              try {
                await fsPromises.unlink(path.join(platformPath, file));
                results.roms.filesDeleted++;
              } catch (err) {
                results.roms.errors.push(`${platform}/${file}: ${err.message}`);
              }
            }
            // Remove empty platform directory
            try {
              await fsPromises.rmdir(platformPath);
            } catch (err) {
              // Ignore if not empty
            }
          }
        }
      }
      console.log(`✅ Deleted ${results.roms.filesDeleted} ROM files`);
    } catch (err) {
      results.roms.errors.push(`General error: ${err.message}`);
      console.error('❌ ROM deletion failed:', err.message);
    }

    // 3. Delete all cover images
    console.log('🗑️  Factory Reset: Deleting cover images...');
    try {
      if (fsSync.existsSync(config.COVERS_PATH)) {
        const covers = await fsPromises.readdir(config.COVERS_PATH);
        for (const cover of covers) {
          try {
            await fsPromises.unlink(path.join(config.COVERS_PATH, cover));
            results.covers.filesDeleted++;
          } catch (err) {
            results.covers.errors.push(`${cover}: ${err.message}`);
          }
        }
      }
      console.log(`✅ Deleted ${results.covers.filesDeleted} cover images`);
    } catch (err) {
      results.covers.errors.push(`General error: ${err.message}`);
      console.error('❌ Cover deletion failed:', err.message);
    }

    // 4. Delete local save backups
    console.log('🗑️  Factory Reset: Deleting local save backups...');
    try {
      const savesPath = path.join(config.STORAGE_PATH, 'saves');
      if (fsSync.existsSync(savesPath)) {
        const deleteDirRecursive = async (dirPath) => {
          const entries = await fsPromises.readdir(dirPath, { withFileTypes: true });
          for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name);
            if (entry.isDirectory()) {
              await deleteDirRecursive(fullPath);
            } else {
              await fsPromises.unlink(fullPath);
              results.saves.filesDeleted++;
            }
          }
          await fsPromises.rmdir(dirPath);
        };
        await deleteDirRecursive(savesPath);
      }
      console.log(`✅ Deleted ${results.saves.filesDeleted} save backup files`);
    } catch (err) {
      results.saves.errors.push(`General error: ${err.message}`);
      console.error('❌ Save backup deletion failed:', err.message);
    }

    console.log('✅ Factory Reset completed!');

    res.json({
      success: true,
      message: 'Factory reset completed. PixelBridge is now fresh!',
      results,
      next_steps: [
        'Restart the container to reinitialize the database',
        'Upload new ROMs via the web interface',
        'Configure RetroArch connection settings'
      ]
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Factory reset failed',
      error: err.message
    });
  }
});

/**
 * POST /api/debug/fix-cover-paths
 * Fix cover paths in database by matching file_hash to existing cover files
 */
router.post('/fix-cover-paths', async (req, res) => {
  try {
    const Rom = require('../models/Rom');
    const { db } = require('../config/database');
    const fsSync = require('fs');

    const results = {
      fixed: [],
      notFound: [],
      alreadySet: []
    };

    // Get all ROMs
    const roms = await new Promise((resolve, reject) => {
      Rom.getAll({}, (err, roms) => {
        if (err) reject(err);
        else resolve(roms);
      });
    });

    for (const rom of roms) {
      if (rom.cover_image_path) {
        results.alreadySet.push({ id: rom.id, title: rom.title });
        continue;
      }

      // Try to find cover by file_hash
      const expectedCoverPath = path.join(config.COVERS_PATH, `${rom.file_hash}_cover.jpg`);

      if (fsSync.existsSync(expectedCoverPath)) {
        // Update database
        await new Promise((resolve, reject) => {
          db.run(
            'UPDATE roms SET cover_image_path = ? WHERE id = ?',
            [expectedCoverPath, rom.id],
            (err) => {
              if (err) reject(err);
              else resolve();
            }
          );
        });
        results.fixed.push({ id: rom.id, title: rom.title, path: expectedCoverPath });
        console.log(`✅ Fixed cover path for: ${rom.title}`);
      } else {
        results.notFound.push({ id: rom.id, title: rom.title, expected: expectedCoverPath });
      }
    }

    res.json({
      success: true,
      message: 'Cover paths fix completed',
      results
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Fix cover paths failed',
      error: err.message
    });
  }
});

/**
 * GET /api/debug/cleanup/preview
 * Preview what would be deleted without actually deleting
 */
router.get('/cleanup/preview', async (req, res) => {
  try {
    const Rom = require('../models/Rom');
    const fs = require('fs').promises;
    const path = require('path');

    // Get all covers in filesystem
    const coverFiles = await fs.readdir(config.COVERS_PATH);

    // Get all covers referenced in database
    const roms = await new Promise((resolve, reject) => {
      Rom.getAll({}, (err, roms) => {
        if (err) return reject(err);
        resolve(roms);
      });
    });

    const referencedCovers = new Set();
    roms.forEach(rom => {
      if (rom.cover_image_path) {
        referencedCovers.add(path.basename(rom.cover_image_path));
      }
    });

    // Find orphaned covers
    const orphanedCovers = coverFiles.filter(file => {
      const ext = path.extname(file).toLowerCase();
      if (!['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
        return false;
      }
      return !referencedCovers.has(file);
    });

    res.json({
      orphaned_covers: {
        count: orphanedCovers.length,
        files: orphanedCovers
      },
      total_covers: coverFiles.length,
      referenced_covers: referencedCovers.size
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Preview failed',
      error: err.message
    });
  }
});

/**
 * GET /api/debug/local-saves
 * List all local save backups
 */
router.get('/local-saves', async (req, res) => {
  try {
    const fsSync = require('fs');
    const fsPromises = require('fs').promises;
    const pathModule = require('path');
    const Rom = require('../models/Rom');

    const savesBasePath = pathModule.join(config.STORAGE_PATH, 'saves');
    const result = {
      saves_path: savesBasePath,
      exists: fsSync.existsSync(savesBasePath),
      backups: []
    };

    if (!result.exists) {
      return res.json(result);
    }

    // Get all ROM hashes
    const roms = await new Promise((resolve, reject) => {
      Rom.getAll({}, (err, roms) => {
        if (err) reject(err);
        else resolve(roms);
      });
    });

    const hashToTitle = {};
    roms.forEach(rom => {
      if (rom.file_hash) {
        hashToTitle[rom.file_hash] = rom.title;
      }
    });

    // List all backup directories
    const entries = await fsPromises.readdir(savesBasePath, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const backupDir = pathModule.join(savesBasePath, entry.name);
        const backup = {
          hash: entry.name,
          rom_title: hashToTitle[entry.name] || 'Unknown ROM',
          saves: [],
          states: []
        };

        // Check saves subdirectory
        const savesSubDir = pathModule.join(backupDir, 'saves');
        if (fsSync.existsSync(savesSubDir)) {
          backup.saves = await fsPromises.readdir(savesSubDir);
        }

        // Check states subdirectory
        const statesSubDir = pathModule.join(backupDir, 'states');
        if (fsSync.existsSync(statesSubDir)) {
          backup.states = await fsPromises.readdir(statesSubDir);
        }

        if (backup.saves.length > 0 || backup.states.length > 0) {
          result.backups.push(backup);
        }
      }
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to list local saves',
      error: err.message
    });
  }
});

module.exports = router;
