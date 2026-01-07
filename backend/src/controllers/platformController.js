/**
 * Platform Controller
 * Handles HTTP requests for platform endpoints
 */

const Platform = require('../models/Platform');

/**
 * Get all platforms
 * GET /api/platforms
 */
exports.getAllPlatforms = (req, res, next) => {
  const includeRomCount = req.query.include_rom_count === 'true';

  if (includeRomCount) {
    Platform.getPlatformsWithRomCount((err, platforms) => {
      if (err) {
        return next(err);
      }
      res.json({ platforms, count: platforms.length });
    });
  } else {
    Platform.getAll((err, platforms) => {
      if (err) {
        return next(err);
      }
      res.json({ platforms, count: platforms.length });
    });
  }
};

/**
 * Get platform by ID
 * GET /api/platforms/:id
 */
exports.getPlatformById = (req, res, next) => {
  const { id } = req.params;

  Platform.getById(id, (err, platform) => {
    if (err) {
      return next(err);
    }

    if (!platform) {
      return res.status(404).json({
        error: {
          message: 'Platform not found',
          status: 404
        }
      });
    }

    res.json({ platform });
  });
};

/**
 * Get ROMs for a specific platform
 * GET /api/platforms/:id/roms
 */
exports.getPlatformRoms = (req, res, next) => {
  const { id } = req.params;
  const Rom = require('../models/Rom');

  // First check if platform exists
  Platform.getById(id, (err, platform) => {
    if (err) {
      return next(err);
    }

    if (!platform) {
      return res.status(404).json({
        error: {
          message: 'Platform not found',
          status: 404
        }
      });
    }

    // Get ROMs for this platform
    Rom.getByPlatformId(id, (err, roms) => {
      if (err) {
        return next(err);
      }

      res.json({
        platform: {
          id: platform.id,
          name: platform.name,
          short_name: platform.short_name
        },
        roms,
        count: roms.length
      });
    });
  });
};

/**
 * Search platforms
 * GET /api/platforms/search?q=nintendo
 */
exports.searchPlatforms = (req, res, next) => {
  const { q } = req.query;

  if (!q || q.trim().length === 0) {
    return res.status(400).json({
      error: {
        message: 'Search query (q) is required',
        status: 400
      }
    });
  }

  Platform.search(q, (err, platforms) => {
    if (err) {
      return next(err);
    }

    res.json({ platforms, count: platforms.length });
  });
};
