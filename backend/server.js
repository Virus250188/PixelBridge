/**
 * RetroArch ROM Library Backend
 * Main Server Entry Point
 */

const app = require('./src/app');
const config = require('./src/config/env');
const { initializeDatabase } = require('./src/config/database');

// Validate configuration
config.validateConfig();

// Initialize database
try {
  initializeDatabase();
} catch (error) {
  console.error('Failed to initialize database:', error);
  process.exit(1);
}

// Start server
const PORT = config.PORT;
const server = app.listen(PORT, () => {
  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log('  RetroArch ROM Library Backend');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`  Environment:     ${config.NODE_ENV}`);
  console.log(`  Server:          http://localhost:${PORT}`);
  console.log(`  Health Check:    http://localhost:${PORT}/api/health`);
  console.log(`  RetroArch IP:    ${config.RETROARCH_IP}:${config.RETROARCH_PORT}`);
  console.log('═══════════════════════════════════════════════════════');
  console.log('');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\nSIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});
