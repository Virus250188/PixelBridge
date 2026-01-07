/**
 * Main API Router
 * Aggregates all route modules
 */

const express = require('express');
const router = express.Router();

// Import route modules
const platformRoutes = require('./platforms');
const romRoutes = require('./roms');
const uploadRoutes = require('./upload');
const metadataRoutes = require('./metadata');
const retroarchRoutes = require('./retroarch');
const settingsRoutes = require('./settings');
const debugRoutes = require('./debug');

// Mount routes
router.use('/platforms', platformRoutes);
router.use('/roms', romRoutes);
router.use('/upload', uploadRoutes);
router.use('/metadata', metadataRoutes);
router.use('/retroarch', retroarchRoutes);
router.use('/settings', settingsRoutes);
router.use('/debug', debugRoutes);

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    name: 'RetroArch ROM Library API',
    version: '1.0.0',
    endpoints: {
      platforms: '/api/platforms',
      roms: '/api/roms',
      upload: '/api/upload',
      metadata: '/api/metadata',
      retroarch: '/api/retroarch',
      settings: '/api/settings',
      debug: '/api/debug',
      health: '/api/health'
    }
  });
});

module.exports = router;
