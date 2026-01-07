/**
 * ROM Routes
 * /api/roms/*
 */

const express = require('express');
const router = express.Router();
const romController = require('../controllers/romController');
const { body } = require('express-validator');

// GET /api/roms/recent/added - Get recently added ROMs
router.get('/recent/added', romController.getRecentlyAdded);

// GET /api/roms/recent/played - Get recently played ROMs
router.get('/recent/played', romController.getRecentlyPlayed);

// GET /api/roms/favorites - Get favorite ROMs
router.get('/favorites', romController.getFavorites);

// GET /api/roms - Get all ROMs with filters
router.get('/', romController.getAllRoms);

// GET /api/roms/:id - Get ROM by ID
router.get('/:id', romController.getRomById);

// POST /api/roms - Create new ROM (manual entry)
router.post('/',
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('platform_id').isInt().withMessage('Platform ID must be an integer'),
    body('file_name').trim().notEmpty().withMessage('File name is required'),
    body('file_path').trim().notEmpty().withMessage('File path is required')
  ],
  romController.createRom
);

// PUT /api/roms/:id - Update ROM
router.put('/:id',
  [
    body('title').optional().trim().notEmpty()
  ],
  romController.updateRom
);

// PATCH /api/roms/:id/favorite - Toggle favorite
router.patch('/:id/favorite', romController.toggleFavorite);

// DELETE /api/roms/:id - Delete ROM
router.delete('/:id', romController.deleteRom);

module.exports = router;
