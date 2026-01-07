/**
 * Metadata Controller
 * Handles metadata search and fetching
 */

const metadataService = require('../services/metadataService');
const Rom = require('../models/Rom');
const Platform = require('../models/Platform');

/**
 * Search for game metadata
 * POST /api/metadata/search
 * Body: { title, platform_short_name }
 */
exports.searchMetadata = async (req, res, next) => {
  try {
    if (!metadataService.isEnabled()) {
      return res.status(503).json({
        error: {
          message: 'Metadata service not configured. Please set IGDB API credentials.',
          status: 503
        }
      });
    }

    const { title, platform_short_name } = req.body;

    if (!title) {
      return res.status(400).json({
        error: {
          message: 'Title is required',
          status: 400
        }
      });
    }

    const results = await metadataService.searchGame(title, platform_short_name);

    res.json({
      query: {
        title,
        platform: platform_short_name || 'all'
      },
      results,
      count: results.length
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Get detailed metadata by IGDB ID
 * GET /api/metadata/igdb/:id
 */
exports.getMetadataById = async (req, res, next) => {
  try {
    if (!metadataService.isEnabled()) {
      return res.status(503).json({
        error: {
          message: 'Metadata service not configured',
          status: 503
        }
      });
    }

    const igdbId = parseInt(req.params.id);

    if (isNaN(igdbId)) {
      return res.status(400).json({
        error: {
          message: 'Invalid IGDB ID',
          status: 400
        }
      });
    }

    const details = await metadataService.getGameDetails(igdbId);

    res.json({ metadata: details });

  } catch (error) {
    next(error);
  }
};

/**
 * Refresh metadata for existing ROM
 * POST /api/metadata/refresh/:rom_id
 */
exports.refreshRomMetadata = async (req, res, next) => {
  try {
    if (!metadataService.isEnabled()) {
      return res.status(503).json({
        error: {
          message: 'Metadata service not configured',
          status: 503
        }
      });
    }

    const romId = parseInt(req.params.rom_id);

    // Get ROM from database
    const rom = await new Promise((resolve, reject) => {
      Rom.getById(romId, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    if (!rom) {
      return res.status(404).json({
        error: {
          message: 'ROM not found',
          status: 404
        }
      });
    }

    // Get platform info
    const platform = await new Promise((resolve, reject) => {
      Platform.getById(rom.platform_id, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    // Fetch metadata (pass file_hash for stable cover naming)
    const metadata = await metadataService.autoFetchMetadata(
      rom.title,
      platform.short_name,
      romId,
      rom.file_hash
    );

    if (Object.keys(metadata).length === 0) {
      return res.status(404).json({
        error: {
          message: 'No metadata found for this ROM',
          status: 404
        }
      });
    }

    // Update ROM with metadata
    const updateData = {
      title: rom.title,
      description: metadata.description || rom.description,
      release_date: metadata.release_date || rom.release_date,
      developer: metadata.developer || rom.developer,
      publisher: metadata.publisher || rom.publisher,
      genre: metadata.genre || rom.genre,
      rating: metadata.rating || rom.rating,
      cover_image_path: metadata.cover_image_path || rom.cover_image_path,
      screenshot_path: rom.screenshot_path,
      igdb_id: metadata.igdb_id || rom.igdb_id,
      screenscraper_id: rom.screenscraper_id
    };

    await new Promise((resolve, reject) => {
      Rom.update(romId, updateData, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    // Get updated ROM
    const updatedRom = await new Promise((resolve, reject) => {
      Rom.getById(romId, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    res.json({
      message: 'Metadata refreshed successfully',
      rom: updatedRom,
      metadata_updated: true
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Apply metadata to ROM from IGDB ID
 * POST /api/metadata/apply/:rom_id
 * Body: { igdb_id }
 */
exports.applyMetadata = async (req, res, next) => {
  try {
    if (!metadataService.isEnabled()) {
      return res.status(503).json({
        error: {
          message: 'Metadata service not configured',
          status: 503
        }
      });
    }

    const romId = parseInt(req.params.rom_id);
    const igdbId = parseInt(req.body.igdb_id);

    if (isNaN(igdbId)) {
      return res.status(400).json({
        error: {
          message: 'Valid IGDB ID is required',
          status: 400
        }
      });
    }

    // Get ROM
    const rom = await new Promise((resolve, reject) => {
      Rom.getById(romId, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    if (!rom) {
      return res.status(404).json({
        error: {
          message: 'ROM not found',
          status: 404
        }
      });
    }

    // Fetch metadata
    const details = await metadataService.getGameDetails(igdbId);

    // Download cover (use file_hash for stable naming)
    let coverPath = rom.cover_image_path;
    if (details.cover_url) {
      const downloadedCover = await metadataService.downloadCoverImage(details.cover_url, romId, rom.file_hash);
      if (downloadedCover) {
        coverPath = downloadedCover;
      }
    }

    // Update ROM
    const updateData = {
      title: details.title || rom.title,
      description: details.description,
      release_date: details.release_date,
      developer: details.developer,
      publisher: details.publisher,
      genre: details.genre,
      rating: details.rating,
      cover_image_path: coverPath,
      screenshot_path: rom.screenshot_path,
      igdb_id: igdbId,
      screenscraper_id: rom.screenscraper_id
    };

    await new Promise((resolve, reject) => {
      Rom.update(romId, updateData, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    // Get updated ROM
    const updatedRom = await new Promise((resolve, reject) => {
      Rom.getById(romId, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    res.json({
      message: 'Metadata applied successfully',
      rom: updatedRom
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Check metadata service status
 * GET /api/metadata/status
 */
exports.getMetadataStatus = (req, res) => {
  res.json({
    enabled: metadataService.isEnabled(),
    service: 'IGDB',
    configured: !!(metadataService.clientId && metadataService.accessToken)
  });
};

module.exports = exports;
