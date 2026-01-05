<div align="center">

![PixelBridge](frontend/public/logo-banner-transparent.png)

# PixelBridge

**Modern Web-Based ROM Library Manager for RetroArch**

[![Docker Hub](https://img.shields.io/badge/Docker%20Hub-miguel1988%2Fpixelbridge-blue?logo=docker)](https://hub.docker.com/r/miguel1988/pixelbridge)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Docker-2496ED?logo=docker)](https://www.docker.com/)

Bridge your retro gaming collection to RetroArch on Apple TV with automatic metadata, cover art, and seamless synchronization.

[Features](#-features) • [Quick Start](#-quick-start) • [Installation](#-installation) • [Usage](#-usage) • [Documentation](#-documentation)

</div>

---

## ✨ Features

### 🎮 Core Features
- **25+ Gaming Platforms** - Support for NES, SNES, PlayStation, Game Boy, and more
- **Smart Library Management** - Browse and organize your ROM collection with cover art
- **Automatic Metadata** - Fetch game information and cover images from IGDB
- **Apple TV Sync** - Direct push to RetroArch via WebUI with complete workflow automation
- **Save Game Backup** - Automatic backup and restore of game saves during sync
- **Favorites System** - Mark and filter your favorite games

### 🛠️ Technical Highlights
- **One-Click Deployment** - Single Docker container with frontend, backend, and nginx
- **Multi-Platform Support** - Docker images for AMD64 and ARM64 architectures
- **Modern UI** - Pixel-art themed interface built with React
- **RESTful API** - Clean API for ROM management and RetroArch integration
- **SQLite Database** - Lightweight, file-based database with automatic migrations
- **Volume Persistence** - All data stored in Docker volumes for easy backup

---

## 🚀 Quick Start

### Prerequisites
- Docker installed ([Get Docker](https://docs.docker.com/get-docker/))
- RetroArch on Apple TV with WebUI enabled
- IGDB API credentials ([Get free credentials](#1-get-igdb-api-credentials))

### One-Command Start

```bash
docker run -d \
  --name pixelbridge \
  -p 80:80 \
  -e RETROARCH_IP=192.168.1.100 \
  -e IGDB_CLIENT_ID=your_client_id \
  -e IGDB_ACCESS_TOKEN=your_token \
  -v pixelbridge-data:/app/backend/storage \
  miguel1988/pixelbridge:latest
```

Then open http://localhost in your browser.

---

## 📦 Installation

### Option 1: Docker Run (Simplest)

```bash
# Pull the image
docker pull miguel1988/pixelbridge:latest

# Run the container
docker run -d \
  --name pixelbridge \
  --restart unless-stopped \
  -p 80:80 \
  -e RETROARCH_IP=192.168.1.100 \
  -e IGDB_CLIENT_ID=your_twitch_client_id \
  -e IGDB_ACCESS_TOKEN=your_igdb_token \
  -v pixelbridge-data:/app/backend/storage \
  miguel1988/pixelbridge:latest
```

### Option 2: Docker Compose (Recommended)

1. **Create `docker-compose.yml`:**

```yaml
version: '3.8'

services:
  pixelbridge:
    image: miguel1988/pixelbridge:latest
    container_name: pixelbridge
    restart: unless-stopped
    ports:
      - "80:80"
    environment:
      - RETROARCH_IP=192.168.1.100
      - IGDB_CLIENT_ID=${IGDB_CLIENT_ID}
      - IGDB_ACCESS_TOKEN=${IGDB_ACCESS_TOKEN}
    volumes:
      - pixelbridge-data:/app/backend/storage

volumes:
  pixelbridge-data:
```

2. **Create `.env` file:**

```bash
IGDB_CLIENT_ID=your_twitch_client_id
IGDB_ACCESS_TOKEN=your_igdb_access_token
```

3. **Start the container:**

```bash
docker-compose up -d
```

### Option 3: Unraid (Community Applications)

1. Search for "PixelBridge" in Community Applications
2. Click Install
3. Configure your IGDB credentials and Apple TV IP
4. Click Apply

---

## 🔑 Setup Guide

### 1. Get IGDB API Credentials

IGDB (Internet Game Database) provides free game metadata and cover art.

**Steps:**

1. Go to [Twitch Developer Portal](https://dev.twitch.tv/)
2. Sign in with your Twitch account (create one if needed)
3. Click **"Register Your Application"**
4. Fill in:
   - **Name**: PixelBridge (or any name)
   - **OAuth Redirect URLs**: `http://localhost`
   - **Category**: Application Integration
5. Click **Create**
6. Copy your **Client ID** and **Client Secret**
7. Generate an access token using curl:

```bash
curl -X POST 'https://id.twitch.tv/oauth2/token' \
  -d 'client_id=YOUR_CLIENT_ID' \
  -d 'client_secret=YOUR_CLIENT_SECRET' \
  -d 'grant_type=client_credentials'
```

8. Copy the `access_token` from the response (valid for ~60 days)

### 2. Enable RetroArch WebUI

**On your Apple TV:**

1. Start RetroArch
2. Go to **Settings → Network**
3. Enable **Network Commands**
4. Enable **Web User Interface**
5. Note the IP address displayed
6. Update the `RETROARCH_IP` environment variable with this IP

---

## 🎮 Usage

### Uploading ROMs

1. Click **"Upload ROM"** in the navigation
2. Drag & drop ROM files (or click to browse)
3. Supported formats: `.nes`, `.snes`, `.sfc`, `.gb`, `.gbc`, `.gba`, `.iso`, `.bin`, `.cue`, `.zip`, `.7z`
4. Platform is auto-detected from file extension
5. Metadata and cover art are fetched automatically
6. ROMs appear in your library organized by platform

### Syncing to Apple TV

1. Ensure Apple TV status shows **ONLINE** (green indicator)
2. Click on **OFFLINE** if needed to configure the IP address
3. Select ROMs using checkboxes
4. Click **"Push to Apple TV"**
5. Monitor the 5-phase sync process:
   - Phase 1: Backup save games
   - Phase 2: Clear old ROMs/playlists
   - Phase 3: Upload selected ROMs
   - Phase 4: Generate playlists
   - Phase 5: Restore save games
6. Launch RetroArch and enjoy your games!

### Managing Your Library

- **Filter by Platform**: Click platform buttons at the top
- **View Details**: Click the info icon (ℹ️) on any ROM card
- **Add to Favorites**: Click the heart icon in ROM details
- **Delete ROM**: Click delete button in ROM details modal
- **Save Indicator**: Diskette icon shows backed-up save games

---

## 📚 Documentation

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `RETROARCH_IP` | Yes | - | Your Apple TV's IP address |
| `IGDB_CLIENT_ID` | Yes | - | Twitch Client ID for IGDB API |
| `IGDB_ACCESS_TOKEN` | Yes | - | IGDB Access Token |
| `RETROARCH_PORT` | No | `80` | RetroArch WebUI port |
| `NODE_ENV` | No | `production` | Environment mode |
| `PORT` | No | `3000` | Backend API port |
| `MAX_FILE_SIZE` | No | `4294967296` | Max upload size (4GB) |

### Supported Platforms

Nintendo: NES, SNES, N64, GameCube, Wii, Game Boy, GBC, GBA, DS, 3DS
Sony: PlayStation 1, 2, 3, PSP
Sega: Genesis, Dreamcast, Game Gear, Saturn
Atari: 2600, 5200, 7800, Lynx, Jaguar
NEC: TurboGrafx-16, PC Engine

### API Endpoints

- `GET /api/health` - Health check
- `GET /api/platforms` - List all platforms
- `GET /api/roms` - List ROMs (supports filters)
- `POST /api/upload` - Upload ROM files
- `POST /api/retroarch/sync` - Sync ROMs to Apple TV
- `GET /api/retroarch/status` - Check Apple TV connection
- `PATCH /api/roms/:id/favorite` - Toggle favorite status
- `DELETE /api/roms/:id` - Delete ROM

Full API documentation: http://localhost:3000/api

---

## 🛠️ Troubleshooting

### Apple TV Shows Offline

**Symptoms**: Status indicator shows red "OFFLINE"

**Solutions**:
1. Click on the **OFFLINE** status to open settings
2. Verify the Apple TV IP address is correct
3. Ensure RetroArch WebUI is enabled on Apple TV
4. Check that Apple TV and server are on the same network
5. Test connection using the "Test Connection" button

### ROMs Not Uploading

**Symptoms**: Upload fails or hangs

**Solutions**:
- Check file size doesn't exceed 4GB (configurable)
- Verify file extension is supported
- Check backend logs: `docker logs pixelbridge`
- Ensure storage volume has sufficient space
- Try uploading one file at a time

### Metadata Not Fetching

**Symptoms**: Games show no cover art or metadata

**Solutions**:
- Verify IGDB credentials are correct in environment variables
- Check access token hasn't expired (regenerate if needed)
- Inspect backend logs for IGDB API errors
- Some games may not be in IGDB database

### Database Corruption

**Symptoms**: App crashes or data is missing

**Solutions**:
```bash
# Backup current data first
docker cp pixelbridge:/app/backend/storage ./backup

# Reset database
docker stop pixelbridge
docker rm pixelbridge
docker volume rm pixelbridge-data

# Restart container (will recreate database)
docker-compose up -d
```

---

## 🐳 Docker Images

### Available Images

- **All-in-One** (Recommended): `miguel1988/pixelbridge:latest`
- **Backend Only**: `miguel1988/pixelbridge-backend:latest`
- **Frontend Only**: `miguel1988/pixelbridge-frontend:latest`

### Architecture Support

- **linux/amd64** - x86_64 systems (Intel/AMD)
- **linux/arm64** - ARM64 systems (Apple Silicon, Raspberry Pi 4+)

### Tags

- `latest` - Latest stable release
- `1.0.3` - Specific version

### Building from Source

```bash
# Clone repository
git clone https://github.com/Virus250188/PixelBridge.git
cd PixelBridge

# Build combined image
docker build -f Dockerfile.combined -t pixelbridge:local .

# Or build individual images
docker build -t pixelbridge-backend:local ./backend
docker build -t pixelbridge-frontend:local ./frontend
```

---

## 💾 Backup & Restore

### Backup Data

```bash
# Backup to local directory
docker run --rm \
  -v pixelbridge-data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/pixelbridge-backup.tar.gz /data
```

### Restore Data

```bash
# Restore from backup
docker run --rm \
  -v pixelbridge-data:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/pixelbridge-backup.tar.gz -C /
```

### Manual Backup

You can also copy files directly:

```bash
# Copy storage to local machine
docker cp pixelbridge:/app/backend/storage ./pixelbridge-backup

# Restore storage
docker cp ./pixelbridge-backup pixelbridge:/app/backend/storage
```

---

## 🤝 Contributing

This project is primarily for personal use and is **not actively maintained**.

However, community contributions are welcome! Feel free to:
- 🐛 Report bugs via [GitHub Issues](https://github.com/Virus250188/PixelBridge/issues)
- 🔧 Submit pull requests with fixes or features
- 📖 Improve documentation
- ⭐ Star the repository if you find it useful

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

**TL;DR**: You are free to use, modify, and distribute this software. No warranty provided.

---

## 🙏 Acknowledgments

- **[IGDB](https://www.igdb.com/)** - Game metadata and cover art
- **[RetroArch](https://www.retroarch.com/)** - Multi-platform emulation framework
- **Press Start 2P Font** - Pixel-perfect typography

---

## 🔗 Resources

- [GitHub Repository](https://github.com/Virus250188/PixelBridge)
- [Docker Hub](https://hub.docker.com/r/miguel1988/pixelbridge)
- [IGDB API Documentation](https://api-docs.igdb.com/)
- [RetroArch Documentation](https://docs.libretro.com/)
- [Twitch Developer Portal](https://dev.twitch.tv/)

---

## 📊 Project Stats

- **Platforms Supported**: 25+
- **File Formats**: 15+
- **Database**: SQLite
- **Backend**: Node.js + Express
- **Frontend**: React + Vite
- **Deployment**: Docker

---

<div align="center">

**PixelBridge v1.0**

*Bridge your retro gaming library to the modern era* 🎮✨

Built with 🎮 through **Vibecoding** - Where vision meets code.

Powered by [Claude Code](https://claude.com/claude-code) & [VS Code](https://code.visualstudio.com/)

[⬆ Back to Top](#pixelbridge)

</div>
