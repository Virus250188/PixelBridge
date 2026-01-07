# PixelBridge - User Guide

![PixelBridge Banner](frontend/public/logo-banner-transparent.png)

A comprehensive guide to using PixelBridge - your bridge between modern ROM management and RetroArch on Apple TV.

## Table of Contents

1. [Getting Started](#getting-started)
2. [First Time Setup](#first-time-setup)
3. [Uploading ROMs](#uploading-roms)
4. [Managing Your Library](#managing-your-library)
5. [Syncing to Apple TV](#syncing-to-apple-tv)
6. [Advanced Features](#advanced-features)
7. [Troubleshooting](#troubleshooting)

---

## Getting Started

### What You'll Need

- **Apple TV** with RetroArch installed
- **Computer** (Mac, Windows, Linux) with Docker
- **ROMs** for your favorite retro games
- **Network** - Apple TV and computer on same network
- **IGDB API Credentials** (free from Twitch Developer)

### Installation

1. **Download PixelBridge**
   ```bash
   git clone https://github.com/yourusername/pixelbridge.git
   cd pixelbridge
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   nano .env
   ```

   Add your IGDB credentials (see [Getting IGDB Credentials](#getting-igdb-credentials))

3. **Start Application**
   ```bash
   ./start.sh
   ```

   Or manually:
   ```bash
   docker-compose up -d
   ```

4. **Access Web Interface**

   Open browser: http://localhost

---

## First Time Setup

### 1. Getting IGDB Credentials

IGDB (Internet Game Database) provides game metadata, covers, and descriptions automatically.

**Quick Method:**
```bash
./get-igdb-token.sh
```

**Manual Method:**

1. Go to https://dev.twitch.tv/console
2. Login with Twitch account (create one if needed)
3. Click **"Register Your Application"**
4. Fill in:
   - **Name**: PixelBridge IGDB
   - **OAuth Redirect URL**: http://localhost
   - **Category**: Application Integration
5. Click **"Create"**
6. Click **"Manage"** on your app
7. Copy **Client ID**
8. Click **"New Secret"** → Copy **Client Secret**
9. Generate Access Token:

```bash
curl -X POST 'https://id.twitch.tv/oauth2/token' \
  -d 'client_id=YOUR_CLIENT_ID' \
  -d 'client_secret=YOUR_CLIENT_SECRET' \
  -d 'grant_type=client_credentials'
```

10. Copy the `access_token` from response
11. Add both to `.env`:

```bash
IGDB_CLIENT_ID=abc123xyz
IGDB_ACCESS_TOKEN=def456uvw
```

### 2. RetroArch Apple TV Setup

1. **Start RetroArch** on Apple TV
2. Navigate to **Settings → Network**
3. Enable **"Network Commands"**
4. Enable **"Web User Interface"**
5. Note the IP address displayed (e.g., `192.168.1.100`)

### 3. Configure Apple TV Connection

1. Open PixelBridge: http://localhost
2. Look at the connection status indicator in header
3. If showing **"OFFLINE"** (red):
   - Click on the OFFLINE status
   - Enter your Apple TV IP address
   - Click **"Test Connection"**
   - Click **"Save"**
4. Status should now show **"READY PLAYER 1"** (green)

---

## Uploading ROMs

### Supported Platforms

PixelBridge supports 25+ retro gaming platforms:

| Platform | Extensions | Example |
|----------|-----------|---------|
| NES | `.nes`, `.zip` | Super Mario Bros |
| SNES | `.snes`, `.sfc` | Super Metroid |
| Game Boy | `.gb`, `.gbc` | Pokémon Red |
| Game Boy Advance | `.gba` | Metroid Fusion |
| PlayStation | `.iso`, `.bin`, `.cue` | Final Fantasy VII |
| Nintendo 64 | `.n64`, `.z64` | Zelda: Ocarina of Time |
| Genesis/Mega Drive | `.smd`, `.md`, `.gen` | Sonic the Hedgehog |
| And many more... |

### Upload Methods

#### Method 1: Drag & Drop (Recommended)

1. Navigate to **Upload** page
2. Drag ROM files from your computer
3. Drop them into the upload zone
4. Wait for upload and processing

#### Method 2: Click to Browse

1. Navigate to **Upload** page
2. Click **"Choose Files"** button
3. Select one or more ROM files
4. Click **"Open"**
5. Upload starts automatically

### What Happens During Upload

1. **File Validation**
   - Checks file size (max 4GB)
   - Validates file extension
   - Scans for duplicates

2. **ZIP Extraction** (if applicable)
   - Automatically extracts `.zip` and `.7z` files
   - Finds ROM files inside
   - Cleans up temporary files

3. **Platform Detection**
   - Auto-detects platform from file extension
   - Organizes into correct folder

4. **Metadata Fetching** (automatic)
   - Searches IGDB for game info
   - Downloads cover art
   - Adds description, publisher, developer, genre
   - Saves rating and player count

5. **Database Entry**
   - Creates ROM entry in library
   - Links to platform
   - Stores file paths

### Upload Limits

- **Max File Size**: 4GB (for PSP ISO files)
- **Simultaneous Uploads**: 10 files
- **Rate Limit**: 50 uploads per hour

### Tips for Best Results

✅ **DO**:
- Use clean ROM filenames (e.g., `Super Mario Bros (USA).nes`)
- Keep files organized before upload
- Use ZIP compression for smaller files

❌ **DON'T**:
- Upload copyrighted games you don't own
- Use special characters in filenames
- Upload files over 4GB

---

## Managing Your Library

### Browsing ROMs

**All Platforms View**
- Click **"All Platforms"** button
- See entire collection
- Sort by title, date added, rating

**Filter by Platform**
- Click platform button (e.g., "SNES (12)")
- View only that platform's games
- Number shows ROM count

### ROM Cards

Each ROM displays:
- **Cover Art** (from IGDB or placeholder)
- **Title** and **Platform**
- **Checkbox** for selection
- **Info Icon** (ℹ️) for details
- **Save Indicator** (💾) if save games exist

### ROM Details

Click the **Info icon** to view:

**Game Information**:
- Description
- Developer
- Publisher
- Genre
- Release Date
- Rating (0-100)
- Player Count

**File Information**:
- Filename
- File Size (MB)

**Actions**:
- ❤️ **Add to Favorites**
- 🗑️ **Delete ROM**

### Favorites System

**Add to Favorites**:
1. Click ROM's info icon
2. Click heart icon (left of delete button)
3. Icon turns red/filled
4. ROM is now favorited

**View Favorites**:
1. Click **"Favorites"** in navigation
2. See only favorited games
3. Quick access to your best games

**Remove from Favorites**:
1. Open ROM details
2. Click filled heart icon
3. Removed from favorites

### Deleting ROMs

⚠️ **Warning**: Deletion is permanent!

1. Click ROM's info icon
2. Click **"🗑️ ROM Löschen"** button
3. Confirm in dialog
4. ROM file, metadata, and cover deleted
5. **Save games are preserved** (backed up separately)

---

## Syncing to Apple TV

### Understanding the Sync Process

PixelBridge uses a **complete sync workflow** to ensure clean, organized ROMs on Apple TV:

**5-Phase Sync**:

1. **Phase 1: Backup** (📦)
   - Downloads all existing save games from Apple TV
   - Stores saves locally by ROM filename
   - Prevents data loss during sync

2. **Phase 2: Cleanup** (🗑️)
   - Deletes ALL old ROMs from Apple TV
   - Removes outdated playlists
   - Ensures fresh start

3. **Phase 3: Upload** (⬆️)
   - Uploads selected ROMs to Apple TV
   - Organized in `/downloads/` directory
   - Progress tracking for each file

4. **Phase 4: Playlists** (📋)
   - Generates RetroArch playlists
   - One playlist per platform
   - Links ROMs to correct cores
   - Includes metadata (title, publisher, etc.)

5. **Phase 5: Restore** (💾)
   - Restores save games for uploaded ROMs
   - Matches saves to filenames
   - Ready to continue playing!

### How to Sync

**Prerequisites**:
- Apple TV is **ONLINE** (green status)
- RetroArch WebUI is enabled
- At least 1 ROM selected

**Steps**:

1. **Select ROMs**
   - Check boxes on ROMs you want to sync
   - Or click **"✓ Alle auswählen"** for all

2. **Selection Bar Appears**
   - Shows count: "X ROM(s) ausgewählt"
   - Shows push button if online

3. **Click Push Button**
   - Button: **"🚀 Push to Apple TV (X)"**
   - Sync process begins

4. **Monitor Progress**
   - Toast notifications show each phase
   - **Phase 1/5**: Backup saves
   - **Phase 2/5**: Clear old data
   - **Phase 3/5**: Upload ROMs
   - **Phase 4/5**: Generate playlists
   - **Phase 5/5**: Restore saves

5. **Success!**
   - Final toast shows summary:
     - Saves backed up
     - ROMs deleted
     - ROMs uploaded
     - Playlists generated
     - Saves restored

### After Sync

1. **Go to Apple TV**
2. **Open RetroArch**
3. **Navigate to**: Playlists
4. **Select platform** (e.g., "Super Nintendo")
5. **Choose game**
6. **Start playing!**

### Sync Tips

✅ **DO**:
- Sync during off-peak hours (faster)
- Select 10-20 ROMs at a time initially
- Test with one ROM first
- Keep Apple TV powered on during sync

❌ **DON'T**:
- Sync during active RetroArch use
- Select 100+ ROMs at once (slow)
- Turn off Apple TV during sync
- Interrupt sync process

### Troubleshooting Sync

**Problem: Sync Fails at Phase 1**
- **Cause**: Cannot connect to Apple TV
- **Fix**: Check IP address in settings, restart RetroArch

**Problem: Sync Fails at Phase 3**
- **Cause**: Network timeout, file too large
- **Fix**: Check network, reduce ROM count

**Problem: Playlists Not Showing**
- **Cause**: RetroArch cache
- **Fix**: Restart RetroArch, refresh playlists

**Problem: Saves Not Restored**
- **Cause**: Filename mismatch
- **Fix**: Ensure ROM names match exactly

---

## Advanced Features

### Save Game Management

**Automatic Backup**:
- Every sync backs up ALL saves from Apple TV
- Stored locally in `backend/storage/saves/`
- Organized by ROM ID
- Never lose progress!

**Save Indicator**:
- 💾 icon appears on ROM cards
- Means save game exists locally
- Green checkmark when backed up

**Manual Save Backup**:
Currently automatic only. Manual backup coming soon!

### Playlist System

**What are Playlists?**
- RetroArch's way of organizing games
- One playlist per platform (e.g., `SNES.lpl`)
- Contains game list with metadata
- Links to correct emulator core

**Auto-Generated Fields**:
- Game title
- ROM path
- Core name
- Database name
- CRC (checksum)

**Platform-to-Core Mapping**:
- SNES → Snes9x
- NES → FCEUmm
- PSX → PCSX ReARMed
- N64 → Mupen64Plus
- And more...

### Metadata Cache

**What's Cached?**
- IGDB API responses
- Downloaded cover images
- Game descriptions
- Publisher/Developer info

**Cache Location**:
- `backend/storage/metadata/`

**Refresh Metadata**:
Coming soon! Will re-fetch from IGDB.

### Bulk Operations

**Select All**:
- Click **"✓ Alle auswählen"**
- All visible ROMs selected
- Respects platform filter

**Deselect All**:
- Appears in selection bar
- Click **"Abwählen"**
- Clears all selections

**Multi-Delete** (Coming Soon):
- Delete multiple ROMs at once
- Bulk favorite toggle
- Batch metadata refresh

---

## Troubleshooting

### Connection Issues

**Problem: Apple TV Shows OFFLINE**

✅ **Solutions**:
1. Click on **OFFLINE** status
2. Verify IP address is correct
3. Check Apple TV is on same network
4. Ensure RetroArch WebUI is enabled
5. Click **"Test Connection"**
6. Save settings

**Problem: Connection Drops During Use**

✅ **Solutions**:
- Apple TV might have sleep mode enabled
- Check network stability
- Restart RetroArch
- Check firewall settings

### Upload Issues

**Problem: Upload Fails Immediately**

✅ **Check**:
- File size under 4GB
- Supported file extension
- Not uploading duplicate
- Enough disk space

**Problem: Upload Stuck at 0%**

✅ **Solutions**:
- Refresh page
- Try smaller files first
- Check browser console for errors
- Clear browser cache

**Problem: Metadata Not Fetching**

✅ **Solutions**:
- Verify IGDB credentials in `.env`
- Check access token validity (expires in 60 days)
- Regenerate token: `./get-igdb-token.sh`
- Check backend logs: `docker-compose logs backend`

### Sync Issues

**Problem: Sync Fails with Error**

✅ **Check Log Details**:
- Phase number indicates where it failed
- Error message in toast notification
- Backend logs: `docker-compose logs backend`

**Common Errors**:

| Error | Cause | Fix |
|-------|-------|-----|
| Connection timeout | Apple TV unreachable | Check IP, restart RetroArch |
| Upload failed | Network issue | Retry with fewer ROMs |
| Playlist error | Invalid ROM data | Re-upload ROM |
| Save restore failed | No save file | Normal if new ROM |

**Problem: RetroArch Shows "No Items"**

✅ **Solutions**:
- Refresh playlists in RetroArch
- Restart RetroArch
- Re-sync ROMs
- Check ROM file extensions match core

### General Issues

**Problem: Website Won't Load**

✅ **Solutions**:
```bash
# Check if containers are running
docker-compose ps

# Restart containers
docker-compose restart

# Check logs
docker-compose logs

# Rebuild if needed
docker-compose down
docker-compose up -d --build
```

**Problem: Database Errors**

✅ **Solutions**:
```bash
# Reset database (⚠️ DELETES ALL DATA!)
docker-compose down -v
docker-compose up -d

# Backup first!
docker run --rm -v pixelbridge-database:/data \
  -v $(pwd):/backup alpine \
  tar czf /backup/database-backup.tar.gz /data
```

**Problem: Out of Disk Space**

✅ **Check Usage**:
```bash
# Check Docker volumes
docker system df -v

# Clean unused data
docker system prune -a --volumes

# Check storage folder
du -sh backend/storage/*
```

### Getting Help

**Documentation**:
- README.md - Installation & Setup
- USER_GUIDE.md - This guide
- GitHub Issues - Known problems

**Logs**:
```bash
# View all logs
docker-compose logs

# Follow logs in real-time
docker-compose logs -f

# Specific service
docker-compose logs backend
docker-compose logs frontend
```

**Support**:
- GitHub Issues: https://github.com/yourusername/pixelbridge/issues
- Include logs when reporting bugs
- Describe steps to reproduce

---

## Best Practices

### Organization Tips

1. **Name ROMs Properly**
   - Use standard naming: `Game Title (Region).ext`
   - Example: `Super Mario World (USA).sfc`
   - Helps metadata matching

2. **Use Favorites**
   - Mark frequently played games
   - Quick access to best titles
   - Easier to sync subset

3. **Regular Backups**
   - Export Docker volumes weekly
   - Keep ROM collection backup
   - Save `.env` file securely

4. **Metadata Management**
   - Let IGDB auto-fetch when possible
   - Fix incorrect matches manually (coming soon)
   - Report bad matches to IGDB

### Performance Tips

1. **Sync Smaller Batches**
   - 10-20 ROMs at a time
   - Faster uploads
   - Easier to troubleshoot

2. **Network Optimization**
   - Use wired connection for computer
   - Apple TV on 5GHz WiFi if possible
   - Avoid peak network hours

3. **Storage Management**
   - Clean up unused ROMs
   - Compress files when possible
   - Monitor disk space

### Security Tips

1. **Protect API Keys**
   - Never share `.env` file
   - Regenerate tokens if exposed
   - Use environment variables in production

2. **Network Security**
   - Run on trusted local network
   - Don't expose to internet
   - Use firewall rules

3. **Legal Considerations**
   - Only upload ROMs you legally own
   - Respect copyright laws
   - No piracy support

---

## Keyboard Shortcuts (Coming Soon)

- `Ctrl/Cmd + U` - Upload page
- `Ctrl/Cmd + F` - Focus search
- `Ctrl/Cmd + A` - Select all visible
- `Esc` - Close modal/deselect

---

## FAQ

**Q: Can I run this without Docker?**
A: Yes, but it's more complex. You'll need Node.js, npm, and manual setup of both backend and frontend.

**Q: Does this work with other devices besides Apple TV?**
A: Potentially! Any device running RetroArch with WebUI enabled should work. Only tested on Apple TV.

**Q: How much storage do I need?**
A: Depends on your collection. PSX games can be 500MB-1GB each. Plan for at least 50GB free.

**Q: Can I use this remotely?**
A: Not recommended. Designed for local network use. Remote access requires VPN and security hardening.

**Q: Will my save games work?**
A: Yes! Save games are automatically backed up and restored during sync.

**Q: What happens if sync fails mid-way?**
A: Depends on phase. Saves are always backed up first. You can re-sync safely.

**Q: Can I customize the cores used?**
A: Not yet in UI. You can edit `backend/src/utils/playlistGenerator.js` manually.

**Q: Does this support homebrew games?**
A: Yes! Upload any compatible ROM file.

---

## Updates & Roadmap

**Current Version**: 1.0.0

**Coming Soon**:
- Manual metadata editing
- Batch operations (delete, favorite)
- Search functionality
- Screenshot management
- Play count tracking
- Recently played list
- Custom playlists
- ROM scraping tools
- Multi-language support

**Future Ideas**:
- Cloud backup integration
- Multiple device support
- Achievements system
- Game notes/reviews
- Netplay configuration

---

## Credits

**PixelBridge** is built with love by the retro gaming community.

**Technologies**:
- React + Vite (Frontend)
- Node.js + Express (Backend)
- SQLite (Database)
- Docker (Deployment)
- IGDB API (Metadata)
- RetroArch (Emulation)

**Special Thanks**:
- Libretro Team (RetroArch)
- IGDB (Game Database)
- Twitch (API Platform)
- Press Start 2P Font
- All contributors

---

**Happy Gaming! 🎮✨**

*Last Updated: January 2026*
