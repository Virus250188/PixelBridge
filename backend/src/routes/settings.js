/**
 * Settings Routes
 * Routes for managing application settings
 */

const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');

// GET /api/settings - Get all settings
router.get('/', settingsController.getAllSettings);

// GET /api/settings/:key - Get single setting
router.get('/:key', settingsController.getSetting);

// PUT /api/settings - Update settings
router.put('/', settingsController.updateSettings);

// DELETE /api/settings/:key - Delete setting
router.delete('/:key', settingsController.deleteSetting);

module.exports = router;
