/**
 * RetroArch Routes
 * /api/retroarch/*
 */

const express = require('express');
const router = express.Router();
const retroarchController = require('../controllers/retroarchController');

// GET /api/retroarch/status - Check connection status
router.get('/status', retroarchController.checkStatus);

// POST /api/retroarch/push/:id - Push single ROM
router.post('/push/:id', retroarchController.pushRom);

// POST /api/retroarch/push-multiple - Push multiple ROMs
router.post('/push-multiple', retroarchController.pushMultipleRoms);

// POST /api/retroarch/sync - Complete sync workflow
router.post('/sync', retroarchController.syncWithRetroArch);

module.exports = router;
