/**
 * Global Error Handling Middleware
 */

function errorHandler(err, req, res, next) {
  // Log error for debugging
  console.error('Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method
  });

  // Default error status and message
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Send error response
  res.status(status).json({
    error: {
      message,
      status,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
}

// 404 Handler
function notFoundHandler(req, res) {
  res.status(404).json({
    error: {
      message: `Cannot ${req.method} ${req.path}`,
      status: 404
    }
  });
}

module.exports = {
  errorHandler,
  notFoundHandler
};
