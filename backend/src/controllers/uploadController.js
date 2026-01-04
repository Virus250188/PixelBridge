/**
 * Upload Controller
 * Handles ROM file uploads
 */

const { processUploadedFile } = require('../services/fileService');
const Rom = require('../models/Rom');
const Platform = require('../models/Platform');
const metadataService = require('../services/metadataService');
const config = require('../config/env');

/**
 * Upload ROM file(s)
 * POST /api/upload
 * Content-Type: multipart/form-data
 * Body: files (multiple), platform_id (optional)
 */
exports.uploadRoms = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: {
          message: 'No files uploaded',
          status: 400
        }
      });
    }

    const platformId = req.body.platform_id ? parseInt(req.body.platform_id) : null;
    const results = {
      success: [],
      failed: []
    };

    // Process each uploaded file
    for (const file of req.files) {
      try {
        console.log(`Processing file: ${file.originalname}`);

        // Process file (extract ZIP, move to storage, calculate hash)
        const romData = await processUploadedFile(file, platformId);

        // Save to database
        const savedRom = await new Promise((resolve, reject) => {
          Rom.create(romData, (err, rom) => {
            if (err) reject(err);
            else resolve(rom);
          });
        });

        // Auto-fetch metadata in background (non-blocking)
        if (metadataService.isEnabled()) {
          const platform = await new Promise((resolve, reject) => {
            Platform.getById(savedRom.platform_id, (err, result) => {
              if (err) reject(err);
              else resolve(result);
            });
          });

          // Fetch metadata asynchronously (don't wait for it)
          metadataService.autoFetchMetadata(
            savedRom.title,
            platform.short_name,
            savedRom.id
          ).then(metadata => {
            if (Object.keys(metadata).length > 0) {
              console.log(`📚 Metadata fetched for: ${savedRom.title}`);

              // Update ROM with metadata
              const updateData = {
                title: savedRom.title,
                description: metadata.description || null,
                release_date: metadata.release_date || null,
                developer: metadata.developer || null,
                publisher: metadata.publisher || null,
                genre: metadata.genre || null,
                rating: metadata.rating || null,
                cover_image_path: metadata.cover_image_path || null,
                screenshot_path: null,
                igdb_id: metadata.igdb_id || null,
                screenscraper_id: null
              };

              Rom.update(savedRom.id, updateData, (err) => {
                if (err) {
                  console.error(`Failed to update metadata for ${savedRom.title}:`, err);
                } else {
                  console.log(`✓ Metadata saved for: ${savedRom.title}`);
                }
              });
            }
          }).catch(err => {
            console.error(`Metadata fetch failed for ${savedRom.title}:`, err.message);
          });
        }

        results.success.push({
          filename: file.originalname,
          rom: savedRom
        });

        console.log(`✓ Successfully processed: ${file.originalname}`);

      } catch (error) {
        console.error(`✗ Failed to process ${file.originalname}:`, error.message);

        results.failed.push({
          filename: file.originalname,
          error: error.message
        });
      }
    }

    // Determine response status
    const status = results.failed.length === 0 ? 201 :
                   results.success.length === 0 ? 400 : 207; // 207 Multi-Status

    res.status(status).json({
      message: `Processed ${req.files.length} file(s)`,
      success: results.success,
      failed: results.failed,
      summary: {
        total: req.files.length,
        success_count: results.success.length,
        failed_count: results.failed.length
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Get upload statistics
 * GET /api/upload/stats
 */
exports.getUploadStats = async (req, res, next) => {
  try {
    const { getStorageStats } = require('../services/fileService');
    const stats = getStorageStats();

    // Get ROM count from database
    const romCount = await new Promise((resolve, reject) => {
      Rom.getCount({}, (err, result) => {
        if (err) reject(err);
        else resolve(result.count);
      });
    });

    res.json({
      storage: stats,
      rom_count: romCount
    });

  } catch (error) {
    next(error);
  }
};
