/**
 * Metadata Routes
 * /api/metadata/*
 */

const express = require('express');
const router = express.Router();
const metadataController = require('../controllers/metadataController');
const { body } = require('express-validator');

// GET /api/metadata/status - Check if metadata service is enabled
router.get('/status', metadataController.getMetadataStatus);

// POST /api/metadata/search - Search for game metadata
router.post('/search',
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('platform_short_name').optional().trim()
  ],
  metadataController.searchMetadata
);

// GET /api/metadata/igdb/:id - Get metadata by IGDB ID
router.get('/igdb/:id', metadataController.getMetadataById);

// POST /api/metadata/refresh/:rom_id - Refresh metadata for ROM
router.post('/refresh/:rom_id', metadataController.refreshRomMetadata);

// POST /api/metadata/apply/:rom_id - Apply specific IGDB metadata to ROM
router.post('/apply/:rom_id',
  [
    body('igdb_id').isInt().withMessage('Valid IGDB ID is required')
  ],
  metadataController.applyMetadata
);

module.exports = router;
