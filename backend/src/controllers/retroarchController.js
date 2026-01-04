/**
 * RetroArch Controller
 * Handles HTTP requests for RetroArch integration
 */

const retroarchService = require('../services/retroarchService');
const Rom = require('../models/Rom');
const Platform = require('../models/Platform');
const playlistGenerator = require('../utils/playlistGenerator');
const path = require('path');
const fs = require('fs');

/**
 * Check RetroArch connection status
 * GET /api/retroarch/status
 */
exports.checkStatus = async (req, res, next) => {
  try {
    const status = await retroarchService.checkConnection();
    res.json(status);
  } catch (error) {
    next(error);
  }
};

/**
 * Push single ROM to RetroArch
 * POST /api/retroarch/push/:id
 */
exports.pushRom = async (req, res, next) => {
  const { id } = req.params;

  Rom.getById(id, async (err, rom) => {
    if (err) {
      return next(err);
    }

    if (!rom) {
      return res.status(404).json({
        error: {
          message: 'ROM not found',
          status: 404
        }
      });
    }

    try {
      const result = await retroarchService.pushRom(rom.file_path, rom.file_name);

      if (result.success) {
        res.json({
          success: true,
          message: `${rom.title} successfully pushed to Apple TV`,
          fileName: rom.file_name
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to push ROM to Apple TV',
          error: result.error
        });
      }
    } catch (error) {
      next(error);
    }
  });
};

/**
 * Push multiple ROMs to RetroArch
 * POST /api/retroarch/push-multiple
 * Body: { rom_ids: [1, 2, 3] }
 */
exports.pushMultipleRoms = async (req, res, next) => {
  const { rom_ids } = req.body;

  if (!Array.isArray(rom_ids) || rom_ids.length === 0) {
    return res.status(400).json({
      error: {
        message: 'rom_ids must be a non-empty array',
        status: 400
      }
    });
  }

  try {
    // Fetch all ROMs
    const roms = [];
    const errors = [];

    for (const id of rom_ids) {
      await new Promise((resolve) => {
        Rom.getById(id, (err, rom) => {
          if (err || !rom) {
            errors.push({ id, error: 'ROM not found' });
          } else {
            roms.push({
              id: rom.id,
              title: rom.title,
              filePath: rom.file_path,
              fileName: rom.file_name
            });
          }
          resolve();
        });
      });
    }

    if (roms.length === 0) {
      return res.status(404).json({
        error: {
          message: 'No valid ROMs found',
          status: 404
        }
      });
    }

    // Push all ROMs
    const results = await retroarchService.pushMultipleRoms(roms);

    res.json({
      success: results.failed.length === 0,
      total: results.total,
      pushed: results.success.length,
      failed: results.failed.length,
      successList: results.success,
      failedList: results.failed
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Complete Sync Workflow: Backup, Clear, Push, Restore
 * POST /api/retroarch/sync
 * Body: { rom_ids: [1, 2, 3] }
 */
exports.syncWithRetroArch = async (req, res, next) => {
  const { rom_ids } = req.body;

  if (!Array.isArray(rom_ids) || rom_ids.length === 0) {
    return res.status(400).json({
      error: {
        message: 'rom_ids must be a non-empty array',
        status: 400
      }
    });
  }

  const syncLog = {
    phase1_backup: { status: 'pending', saves: [], playlists: [] },
    phase2_cleanup: { status: 'pending', deletedRoms: [], deletedPlaylists: [] },
    phase3_push: { status: 'pending', pushed: [], failed: [] },
    phase4_playlists: { status: 'pending', generated: [] },
    phase5_restore: { status: 'pending', restored: [] },
    errors: []
  };

  try {
    // Fetch all selected ROMs with platform info
    const roms = [];
    const romsByPlatform = {};

    for (const id of rom_ids) {
      await new Promise((resolve) => {
        Rom.getById(id, (err, rom) => {
          if (!err && rom) {
            roms.push(rom);

            // Group by platform
            if (!romsByPlatform[rom.platform_id]) {
              romsByPlatform[rom.platform_id] = [];
            }
            romsByPlatform[rom.platform_id].push(rom);
          }
          resolve();
        });
      });
    }

    if (roms.length === 0) {
      return res.status(404).json({
        error: {
          message: 'No valid ROMs found',
          status: 404
        }
      });
    }

    // PHASE 1: Backup current saves and playlists
    console.log('🔄 PHASE 1: Backing up saves and playlists...');
    syncLog.phase1_backup.status = 'in_progress';

    try {
      // Get current playlists
      const currentPlaylists = await retroarchService.getPlaylists();
      syncLog.phase1_backup.playlists = currentPlaylists;

      // Backup saves for each ROM
      const saveBackupDir = path.join(__dirname, '../../storage/saves');
      if (!fs.existsSync(saveBackupDir)) {
        fs.mkdirSync(saveBackupDir, { recursive: true });
      }

      for (const rom of roms) {
        const platform = await new Promise((resolve) => {
          Platform.getById(rom.platform_id, (err, plt) => {
            resolve(plt);
          });
        });

        if (platform && platform.short_name) {
          const coreName = playlistGenerator.getCoreName(platform.short_name);
          const romBackupDir = path.join(saveBackupDir, rom.id.toString());

          const backedUpSaves = await retroarchService.backupSaveGames(
            coreName,
            rom.file_name,
            romBackupDir
          );

          if (backedUpSaves.length > 0) {
            syncLog.phase1_backup.saves.push({
              rom: rom.title,
              files: backedUpSaves
            });
          }
        }
      }

      syncLog.phase1_backup.status = 'completed';
      console.log(`✅ Backed up ${syncLog.phase1_backup.saves.length} save sets`);
    } catch (error) {
      syncLog.phase1_backup.status = 'failed';
      syncLog.errors.push(`Backup phase: ${error.message}`);
      console.error('❌ Backup phase failed:', error.message);
    }

    // PHASE 2: Clear downloads and playlists
    console.log('🗑️  PHASE 2: Clearing old ROMs and playlists...');
    syncLog.phase2_cleanup.status = 'in_progress';

    try {
      // Clear ROMs
      const clearRomsResult = await retroarchService.clearDownloads();
      syncLog.phase2_cleanup.deletedRoms = clearRomsResult.deleted;

      // Clear playlists
      const clearPlaylistsResult = await retroarchService.clearPlaylists();
      syncLog.phase2_cleanup.deletedPlaylists = clearPlaylistsResult.deleted;

      syncLog.phase2_cleanup.status = 'completed';
      console.log(`✅ Deleted ${clearRomsResult.deleted.length} ROMs, ${clearPlaylistsResult.deleted.length} playlists`);
    } catch (error) {
      syncLog.phase2_cleanup.status = 'failed';
      syncLog.errors.push(`Cleanup phase: ${error.message}`);
      console.error('❌ Cleanup phase failed:', error.message);
    }

    // PHASE 3: Push new ROMs
    console.log('⬆️  PHASE 3: Pushing new ROMs...');
    syncLog.phase3_push.status = 'in_progress';

    try {
      const romsToPush = roms.map(rom => ({
        filePath: rom.file_path,
        fileName: rom.file_name
      }));

      const pushResult = await retroarchService.pushMultipleRoms(romsToPush);
      syncLog.phase3_push.pushed = pushResult.success;
      syncLog.phase3_push.failed = pushResult.failed;
      syncLog.phase3_push.status = 'completed';

      console.log(`✅ Pushed ${pushResult.success.length}/${romsToPush.length} ROMs`);
    } catch (error) {
      syncLog.phase3_push.status = 'failed';
      syncLog.errors.push(`Push phase: ${error.message}`);
      console.error('❌ Push phase failed:', error.message);
    }

    // PHASE 4: Generate and upload playlists
    console.log('📋 PHASE 4: Generating playlists...');
    syncLog.phase4_playlists.status = 'in_progress';

    try {
      for (const [platformId, platformRoms] of Object.entries(romsByPlatform)) {
        const platform = await new Promise((resolve) => {
          Platform.getById(platformId, (err, plt) => {
            resolve(plt);
          });
        });

        if (platform && platform.short_name) {
          // Generate playlist
          const playlist = playlistGenerator.generatePlaylist(
            platform.short_name,
            platformRoms
          );

          // Upload playlist
          const playlistFilename = playlistGenerator.getPlaylistFilename(platform.name);
          await retroarchService.uploadPlaylist(playlist, playlistFilename);

          syncLog.phase4_playlists.generated.push({
            platform: platform.name,
            filename: playlistFilename,
            romCount: platformRoms.length
          });

          console.log(`✅ Generated ${playlistFilename} with ${platformRoms.length} ROMs`);
        }
      }

      syncLog.phase4_playlists.status = 'completed';
    } catch (error) {
      syncLog.phase4_playlists.status = 'failed';
      syncLog.errors.push(`Playlist generation: ${error.message}`);
      console.error('❌ Playlist generation failed:', error.message);
    }

    // PHASE 5: Restore saves
    console.log('💾 PHASE 5: Restoring saves...');
    syncLog.phase5_restore.status = 'in_progress';

    try {
      const saveBackupDir = path.join(__dirname, '../../storage/saves');

      for (const rom of roms) {
        const platform = await new Promise((resolve) => {
          Platform.getById(rom.platform_id, (err, plt) => {
            resolve(plt);
          });
        });

        if (platform && platform.short_name) {
          const coreName = playlistGenerator.getCoreName(platform.short_name);
          const romBackupDir = path.join(saveBackupDir, rom.id.toString());

          if (fs.existsSync(romBackupDir)) {
            const restoredSaves = await retroarchService.restoreSaveGames(
              coreName,
              romBackupDir
            );

            if (restoredSaves.length > 0) {
              syncLog.phase5_restore.restored.push({
                rom: rom.title,
                files: restoredSaves
              });
            }
          }
        }
      }

      syncLog.phase5_restore.status = 'completed';
      console.log(`✅ Restored ${syncLog.phase5_restore.restored.length} save sets`);
    } catch (error) {
      syncLog.phase5_restore.status = 'failed';
      syncLog.errors.push(`Restore phase: ${error.message}`);
      console.error('❌ Restore phase failed:', error.message);
    }

    // Send response
    res.json({
      success: syncLog.errors.length === 0,
      message: 'Sync workflow completed',
      log: syncLog
    });

  } catch (error) {
    next(error);
  }
};
