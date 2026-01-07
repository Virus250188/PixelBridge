#!/bin/bash
# PixelBridge - Easy Startup Script

set -e

echo "🎮 PixelBridge - RetroArch ROM Library Manager"
echo "=============================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found!"
    echo "📝 Creating .env from .env.example..."
    cp .env.example .env
    echo ""
    echo "⚠️  IMPORTANT: Please edit .env and add your IGDB credentials!"
    echo "   1. Open .env in a text editor"
    echo "   2. Add IGDB_CLIENT_ID and IGDB_ACCESS_TOKEN"
    echo "   3. Save the file and run this script again"
    echo ""
    echo "   Get credentials at: https://dev.twitch.tv/"
    echo ""
    exit 1
fi

# Check if IGDB credentials are set
if ! grep -q "^IGDB_CLIENT_ID=.\+" .env || ! grep -q "^IGDB_ACCESS_TOKEN=.\+" .env; then
    echo "⚠️  IGDB credentials not configured in .env!"
    echo ""
    echo "Please add your Twitch Developer credentials:"
    echo "   IGDB_CLIENT_ID=your_client_id_here"
    echo "   IGDB_ACCESS_TOKEN=your_access_token_here"
    echo ""
    echo "Get credentials at: https://dev.twitch.tv/"
    echo ""
    exit 1
fi

echo "✅ Configuration OK"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running!"
    echo "   Please start Docker Desktop and try again."
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Build and start containers
echo "🚀 Starting PixelBridge..."
echo ""

docker-compose up -d --build

echo ""
echo "=============================================="
echo "✅ PixelBridge is starting!"
echo ""
echo "📍 Access Points:"
echo "   Web UI:     http://localhost"
echo "   Backend API: http://localhost:3000/api"
echo "   Health:     http://localhost:3000/api/health"
echo ""
echo "📊 Checking status..."
docker-compose ps
echo ""
echo "📝 View logs:"
echo "   docker-compose logs -f"
echo ""
echo "🛑 Stop application:"
echo "   docker-compose down"
echo ""
echo "🎮 Happy Gaming!"
echo "=============================================="
