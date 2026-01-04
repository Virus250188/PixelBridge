/**
 * ROM Controller
 * Handles HTTP requests for ROM endpoints
 */

const Rom = require('../models/Rom');
const { validationResult } = require('express-validator');
const path = require('path');
const fs = require('fs');

/**
 * Check if save games exist for a ROM
 */
function hasSaveGames(romId) {
  const saveDir = path.join(__dirname, '../../storage/saves', romId.toString());
  if (!fs.existsSync(saveDir)) {
    return false;
  }
  const files = fs.readdirSync(saveDir);
  return files.length > 0;
}

/**
 * Get all ROMs with filters
 * GET /api/roms?platform_id=1&search=mario&favorite=true&limit=20&offset=0
 */
exports.getAllRoms = (req, res, next) => {
  const filters = {
    platform_id: req.query.platform_id,
    search: req.query.search,
    favorite: req.query.favorite === 'true',
    sort_by: req.query.sort_by || 'title',
    sort_order: req.query.sort_order || 'ASC',
    limit: req.query.limit,
    offset: req.query.offset
  };

  Rom.getAll(filters, (err, roms) => {
    if (err) {
      return next(err);
    }

    // Add save game status to each ROM
    const romsWithSaveStatus = roms.map(rom => ({
      ...rom,
      has_saves: hasSaveGames(rom.id)
    }));

    // Get total count for pagination
    Rom.getCount(filters, (err, countResult) => {
      if (err) {
        return next(err);
      }

      res.json({
        roms: romsWithSaveStatus,
        count: romsWithSaveStatus.length,
        total: countResult.count,
        filters: {
          platform_id: filters.platform_id || null,
          search: filters.search || null,
          favorite: filters.favorite || false
        }
      });
    });
  });
};

/**
 * Get ROM by ID
 * GET /api/roms/:id
 */
exports.getRomById = (req, res, next) => {
  const { id } = req.params;

  Rom.getById(id, (err, rom) => {
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

    res.json({ rom });
  });
};

/**
 * Create new ROM (manual entry)
 * POST /api/roms
 */
exports.createRom = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const romData = {
    title: req.body.title,
    platform_id: req.body.platform_id,
    file_name: req.body.file_name,
    file_path: req.body.file_path,
    file_size: req.body.file_size,
    file_hash: req.body.file_hash,
    description: req.body.description,
    release_date: req.body.release_date,
    publisher: req.body.publisher,
    developer: req.body.developer,
    genre: req.body.genre,
    rating: req.body.rating,
    players: req.body.players,
    cover_image_path: req.body.cover_image_path,
    screenshot_path: req.body.screenshot_path,
    igdb_id: req.body.igdb_id,
    screenscraper_id: req.body.screenscraper_id
  };

  Rom.create(romData, (err, rom) => {
    if (err) {
      return next(err);
    }

    res.status(201).json({
      message: 'ROM created successfully',
      rom
    });
  });
};

/**
 * Update ROM metadata
 * PUT /api/roms/:id
 */
exports.updateRom = (req, res, next) => {
  const { id } = req.params;

  const romData = {
    title: req.body.title,
    description: req.body.description,
    release_date: req.body.release_date,
    publisher: req.body.publisher,
    developer: req.body.developer,
    genre: req.body.genre,
    rating: req.body.rating,
    players: req.body.players,
    cover_image_path: req.body.cover_image_path,
    screenshot_path: req.body.screenshot_path,
    igdb_id: req.body.igdb_id,
    screenscraper_id: req.body.screenscraper_id
  };

  Rom.update(id, romData, (err, result) => {
    if (err) {
      return next(err);
    }

    if (result.changes === 0) {
      return res.status(404).json({
        error: {
          message: 'ROM not found',
          status: 404
        }
      });
    }

    res.json({
      message: 'ROM updated successfully',
      changes: result.changes
    });
  });
};

/**
 * Toggle favorite status
 * PATCH /api/roms/:id/favorite
 */
exports.toggleFavorite = (req, res, next) => {
  const { id } = req.params;

  Rom.toggleFavorite(id, (err, result) => {
    if (err) {
      return next(err);
    }

    if (result.changes === 0) {
      return res.status(404).json({
        error: {
          message: 'ROM not found',
          status: 404
        }
      });
    }

    res.json({
      message: 'Favorite status toggled',
      changes: result.changes
    });
  });
};

/**
 * Delete ROM
 * DELETE /api/roms/:id
 */
exports.deleteRom = (req, res, next) => {
  const { id } = req.params;
  const fs = require('fs');
  const path = require('path');

  // First get ROM details to find file paths
  Rom.getById(id, (err, rom) => {
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

    // Delete from database
    Rom.delete(id, (err, result) => {
      if (err) {
        return next(err);
      }

      // Delete physical files (non-blocking, ignore errors)
      if (rom.file_path) {
        fs.unlink(rom.file_path, (err) => {
          if (err) console.error(`Failed to delete ROM file: ${rom.file_path}`, err);
          else console.log(`✓ Deleted ROM file: ${rom.file_path}`);
        });
      }

      if (rom.cover_image_path) {
        fs.unlink(rom.cover_image_path, (err) => {
          if (err) console.error(`Failed to delete cover image: ${rom.cover_image_path}`, err);
          else console.log(`✓ Deleted cover image: ${rom.cover_image_path}`);
        });
      }

      res.json({
        message: 'ROM and associated files deleted successfully',
        changes: result.changes
      });
    });
  });
};

/**
 * Get recently added ROMs
 * GET /api/roms/recent/added
 */
exports.getRecentlyAdded = (req, res, next) => {
  const limit = parseInt(req.query.limit) || 10;

  Rom.getRecentlyAdded(limit, (err, roms) => {
    if (err) {
      return next(err);
    }

    res.json({ roms, count: roms.length });
  });
};

/**
 * Get recently played ROMs
 * GET /api/roms/recent/played
 */
exports.getRecentlyPlayed = (req, res, next) => {
  const limit = parseInt(req.query.limit) || 10;

  Rom.getRecentlyPlayed(limit, (err, roms) => {
    if (err) {
      return next(err);
    }

    res.json({ roms, count: roms.length });
  });
};

/**
 * Get favorite ROMs
 * GET /api/roms/favorites
 */
exports.getFavorites = (req, res, next) => {
  Rom.getFavorites((err, roms) => {
    if (err) {
      return next(err);
    }

    res.json({ roms, count: roms.length });
  });
};
