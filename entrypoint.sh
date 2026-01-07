#!/bin/sh
# Entrypoint script for PixelBridge
# Ensures all required directories exist before starting services

echo "🚀 PixelBridge Container Starting..."

# Ensure all storage directories exist in the mounted volume
echo "📁 Creating storage directories..."
mkdir -p /app/backend/storage/roms
mkdir -p /app/backend/storage/covers
mkdir -p /app/backend/storage/metadata
mkdir -p /app/backend/storage/saves
mkdir -p /app/backend/storage/temp
mkdir -p /app/backend/storage/database
mkdir -p /app/backend/storage/screenshots

echo "✓ Storage directories ready"

# Execute the main command (supervisord)
exec "$@"
