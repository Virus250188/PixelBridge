/**
 * Platform Routes
 * /api/platforms/*
 */

const express = require('express');
const router = express.Router();
const platformController = require('../controllers/platformController');

// GET /api/platforms - Get all platforms
router.get('/', platformController.getAllPlatforms);

// GET /api/platforms/search - Search platforms
router.get('/search', platformController.searchPlatforms);

// GET /api/platforms/:id - Get platform by ID
router.get('/:id', platformController.getPlatformById);

// GET /api/platforms/:id/roms - Get ROMs for platform
router.get('/:id/roms', platformController.getPlatformRoms);

module.exports = router;
