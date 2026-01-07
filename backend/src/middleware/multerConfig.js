/**
 * Multer Upload Configuration
 * Handles multipart/form-data file uploads
 */

const multer = require('multer');
const path = require('path');
const { sanitizeFilename, ensureDirectoryExists } = require('../utils/fileHelper');
const { FILE_SIZE_LIMITS, SUPPORTED_EXTENSIONS } = require('../config/constants');

// Temporary upload directory
const TEMP_UPLOAD_DIR = path.join(__dirname, '../../storage/temp');

// Ensure temp directory exists
ensureDirectoryExists(TEMP_UPLOAD_DIR);

/**
 * Multer storage configuration
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, TEMP_UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    // Sanitize and add timestamp to avoid collisions
    const sanitized = sanitizeFilename(file.originalname);
    const timestamp = Date.now();
    const ext = path.extname(sanitized);
    const basename = path.basename(sanitized, ext);
    const uniqueName = `${basename}_${timestamp}${ext}`;

    cb(null, uniqueName);
  }
});

/**
 * File filter - validate file types
 */
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  // Check if extension is supported
  if (SUPPORTED_EXTENSIONS.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${ext} is not supported. Allowed: ${SUPPORTED_EXTENSIONS.join(', ')}`), false);
  }
};

/**
 * Multer upload middleware
 */
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: FILE_SIZE_LIMITS.MAX_ROM_SIZE,
    files: 10 // Max 10 files per upload
  }
});

/**
 * Error handler for Multer errors
 */
function handleMulterError(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        error: {
          message: `File too large. Maximum size: ${FILE_SIZE_LIMITS.MAX_ROM_SIZE / (1024 * 1024 * 1024)}GB`,
          code: err.code,
          status: 413
        }
      });
    }

    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        error: {
          message: 'Too many files. Maximum 10 files per upload.',
          code: err.code,
          status: 400
        }
      });
    }

    return res.status(400).json({
      error: {
        message: err.message,
        code: err.code,
        status: 400
      }
    });
  }

  if (err) {
    return res.status(400).json({
      error: {
        message: err.message,
        status: 400
      }
    });
  }

  next();
}

module.exports = {
  upload,
  handleMulterError,
  TEMP_UPLOAD_DIR
};
