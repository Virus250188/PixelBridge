/**
 * Settings Controller
 * Handles HTTP requests for application settings
 */

const Settings = require('../models/Settings');

/**
 * Get all settings
 * GET /api/settings
 */
exports.getAllSettings = (req, res, next) => {
  Settings.getAll((err, settings) => {
    if (err) {
      return next(err);
    }

    // Provide defaults for missing settings
    const defaults = {
      retroarch_ip: process.env.RETROARCH_IP || '192.168.6.125',
      retroarch_port: process.env.RETROARCH_PORT || '80'
    };

    res.json({
      settings: {
        ...defaults,
        ...settings
      }
    });
  });
};

/**
 * Get a single setting
 * GET /api/settings/:key
 */
exports.getSetting = (req, res, next) => {
  const { key } = req.params;

  Settings.get(key, (err, value) => {
    if (err) {
      return next(err);
    }

    if (value === null) {
      return res.status(404).json({
        error: {
          message: `Setting '${key}' not found`,
          status: 404
        }
      });
    }

    res.json({
      key,
      value
    });
  });
};

/**
 * Update settings
 * PUT /api/settings
 * Body: { retroarch_ip: "192.168.x.x", retroarch_port: "80" }
 */
exports.updateSettings = (req, res, next) => {
  const settings = req.body;

  // Validate settings
  const allowedKeys = ['retroarch_ip', 'retroarch_port'];
  const filteredSettings = {};

  Object.keys(settings).forEach(key => {
    if (allowedKeys.includes(key)) {
      filteredSettings[key] = settings[key];
    }
  });

  if (Object.keys(filteredSettings).length === 0) {
    return res.status(400).json({
      error: {
        message: 'No valid settings provided',
        status: 400
      }
    });
  }

  // Validate IP address format (basic)
  if (filteredSettings.retroarch_ip) {
    const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipPattern.test(filteredSettings.retroarch_ip)) {
      return res.status(400).json({
        error: {
          message: 'Invalid IP address format',
          status: 400
        }
      });
    }
  }

  // Validate port
  if (filteredSettings.retroarch_port) {
    const port = parseInt(filteredSettings.retroarch_port);
    if (isNaN(port) || port < 1 || port > 65535) {
      return res.status(400).json({
        error: {
          message: 'Invalid port number (1-65535)',
          status: 400
        }
      });
    }
  }

  Settings.setMultiple(filteredSettings, (err) => {
    if (err) {
      return next(err);
    }

    res.json({
      success: true,
      message: 'Settings updated successfully',
      settings: filteredSettings
    });
  });
};

/**
 * Delete a setting
 * DELETE /api/settings/:key
 */
exports.deleteSetting = (req, res, next) => {
  const { key } = req.params;

  Settings.delete(key, (err) => {
    if (err) {
      return next(err);
    }

    res.json({
      success: true,
      message: `Setting '${key}' deleted successfully`
    });
  });
};
