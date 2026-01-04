/**
 * Upload Routes
 * /api/upload/*
 */

const express = require('express');
const router = express.Router();
const { upload, handleMulterError } = require('../middleware/multerConfig');
const uploadController = require('../controllers/uploadController');

// POST /api/upload - Upload ROM file(s)
router.post('/',
  upload.array('files', 10), // Accept up to 10 files
  handleMulterError,
  uploadController.uploadRoms
);

// GET /api/upload/stats - Get upload statistics
router.get('/stats', uploadController.getUploadStats);

module.exports = router;
