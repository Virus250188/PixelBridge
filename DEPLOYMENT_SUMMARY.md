# PixelBridge - Deployment & GitHub Summary

## 📋 Projekt-Übersicht

**Name**: PixelBridge
**Version**: 1.0.0
**Beschreibung**: Modern ROM Library Manager mit automatischer Metadata-Erfassung und Apple TV Sync
**Tech Stack**: React 18, Node.js 18, SQLite, Docker, IGDB API, RetroArch WebUI

---

## ✅ Fertiggestellte Features

### Core Features
- ✅ ROM Upload mit Drag & Drop (bis 4GB)
- ✅ ZIP/7z Auto-Extraktion
- ✅ Automatische Platform-Erkennung (25+ Systeme)
- ✅ IGDB Metadata Integration (Cover, Beschreibung, Publisher, etc.)
- ✅ ROM Library mit Grid View
- ✅ Platform-Filter
- ✅ Favoriten System mit Herz-Icons
- ✅ ROM Details Modal mit Info/Delete/Favorite
- ✅ Save-Game Indicator (Disketten-Icon)

### Apple TV Integration
- ✅ Connection Status Monitoring ("READY PLAYER 1")
- ✅ Settings Modal für IP-Konfiguration
- ✅ Complete Sync Workflow (5 Phasen):
  - Phase 1: Backup Savegames
  - Phase 2: Cleanup (alte ROMs & Playlists löschen)
  - Phase 3: Upload neue ROMs
  - Phase 4: Playlist Generation
  - Phase 5: Restore Savegames
- ✅ RetroArch WebUI API Client
- ✅ Playlist Generator mit Core-Mappings

### UI/UX
- ✅ Pixel-Art Theme ("Press Start 2P" Font)
- ✅ Custom Logo & Branding
- ✅ Responsive Design
- ✅ Toast Notifications
- ✅ Loading States & Error Handling
- ✅ Mobile-friendly (zugreifbar via IP-Adresse)

### Backend
- ✅ Express API mit RESTful Endpoints
- ✅ SQLite Datenbank mit better-sqlite3
- ✅ Multer File Upload (4GB Limit)
- ✅ Settings System (IP-Adresse in DB speichern)
- ✅ Helmet Security Middleware
- ✅ CORS für lokales Netzwerk
- ✅ Metadata Service (IGDB API)
- ✅ File Service mit ZIP-Extraktion
- ✅ RetroArch Service (Upload, Download, Delete, Playlists)

### Docker
- ✅ Multi-Stage Frontend Build (Node → Nginx)
- ✅ Backend Dockerfile mit Health Check
- ✅ docker-compose.yml mit Volumes
- ✅ Named Volumes für Persistence
- ✅ nginx.conf mit Reverse Proxy
- ✅ .dockerignore für optimierte Builds
- ✅ Non-root Container User

### Dokumentation
- ✅ README.md (Installation, Features, Deployment)
- ✅ USER_GUIDE.md (Komplette Benutzer-Anleitung)
- ✅ .env.example (Konfiguration Template)
- ✅ start.sh (Easy Startup Script)
- ✅ get-igdb-token.sh (IGDB Token Generator)
- ✅ GITHUB_INFO.md (Repository Setup Guide)
- ✅ Code Review Dokument

---

## 🔒 Security Review - Wichtige Erkenntnisse

### ⚠️ Kritische Issues (Vor Production beheben!)

1. **Keine Authentifizierung** - CRITICAL
   - Jeder kann ROMs uploaden/löschen
   - Fix: API Key oder JWT implementieren

2. **SQL Injection (sort params)** - CRITICAL
   - `sort_by` und `sort_order` nicht validiert
   - Fix: Whitelist in Rom.js:42-44

3. **Path Traversal (RetroArch Service)** - CRITICAL
   - Pfade nicht validiert
   - Fix: validateRetroArchPath() implementieren

4. **Kein Rate Limiting** - CRITICAL
   - Unlimited requests möglich
   - Fix: express-rate-limit aktivieren

5. **Secrets in Docker Compose** - CRITICAL
   - IGDB Credentials in ENV
   - Fix: Docker Secrets verwenden (optional)

### ✅ Gute Practices (bereits implementiert)

- Helmet Security Headers
- Parameterisierte SQL Queries (größtenteils)
- Filename Sanitization
- File Size Limits
- Non-root Docker Container
- .env in .gitignore
- Health Checks
- Error Handling Middleware
- CORS konfiguriert

**Gesamtscore**: 6.5/10 - OK für lokales Netzwerk, NICHT für Public Internet

---

## 📦 Projektstruktur (Aufgeräumt)

```
RetroArch_Addon/
├── .archive/                    # Screenshots & temp files
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── database/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   ├── storage/                 # Docker Volume
│   │   ├── covers/
│   │   ├── metadata/
│   │   ├── roms/
│   │   ├── saves/
│   │   └── temp/
│   ├── Dockerfile
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   │   ├── favicon-*.png
│   │   ├── heart-empty.png
│   │   ├── heart-filled.png
│   │   ├── info-icon.png
│   │   ├── logo-banner.png
│   │   ├── save-icon.png
│   │   └── placeholder.png
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/
│   │   └── styles/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   └── vite.config.js
├── .dockerignore
├── .env                         # NICHT committen!
├── .env.example
├── .gitignore
├── DEPLOYMENT_SUMMARY.md        # Dieses Dokument
├── GITHUB_INFO.md
├── README.md
├── USER_GUIDE.md
├── docker-compose.yml
├── get-igdb-token.sh
└── start.sh
```

---

## 🚀 Deployment Checklist

### Vor dem ersten Start

- [ ] Xcode License akzeptieren: `sudo xcodebuild -license`
- [ ] Git konfigurieren:
  ```bash
  git config --global user.name "Dein Name"
  git config --global user.email "deine@email.com"
  ```
- [ ] IGDB Credentials holen:
  ```bash
  ./get-igdb-token.sh
  ```
- [ ] In `.env` eintragen:
  ```bash
  IGDB_CLIENT_ID=dein_client_id
  IGDB_ACCESS_TOKEN=dein_access_token
  ```

### Docker Start

```bash
# Easy Mode
./start.sh

# Oder manuell
docker-compose up -d --build

# Logs anschauen
docker-compose logs -f

# Status checken
docker-compose ps

# Stoppen
docker-compose down
```

### Zugriff

- **Lokal**: http://localhost
- **Im Netzwerk**: http://DEINE_IP (z.B. http://192.168.6.100)
- **API**: http://localhost:3000/api
- **Health**: http://localhost:3000/api/health

### Apple TV Setup

1. RetroArch starten
2. Settings → Network
3. "Network Commands" aktivieren
4. "Web User Interface" aktivieren
5. IP-Adresse notieren
6. In PixelBridge: OFFLINE klicken → IP eingeben → Testen → Speichern

---

## 📱 Netzwerk-Zugriff (NEU!)

### Konfiguration

- ✅ nginx: Akzeptiert alle IPs (`server_name localhost _;`)
- ✅ CORS: Erlaubt lokales Netzwerk (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
- ✅ Docker: Port 80 auf allen Interfaces (0.0.0.0:80)

### Vom Handy zugreifen

1. Finde Computer-IP:
   ```bash
   # macOS
   ifconfig | grep "inet " | grep -v 127.0.0.1

   # Oder im System Preferences → Network
   ```

2. Auf Handy (im gleichen WLAN):
   - Browser öffnen
   - http://COMPUTER_IP eingeben
   - Z.B. http://192.168.6.100
   - PixelBridge öffnet sich!

3. ROMs auswählen & syncen wie gewohnt

---

## 🐙 GitHub Vorbereitung

### Repository erstellen

1. Gehe zu: https://github.com/new
2. Repository Name: `pixelbridge`
3. Description: *siehe GITHUB_INFO.md*
4. Public oder Private
5. **NICHT** "Initialize with README" (wir haben schon eines!)
6. Erstellen

### Lokales Repo initialisieren

```bash
cd /path/to/pixelbridge

# Git initialisieren (falls noch nicht)
git init

# Main branch
git branch -M main

# .gitattributes erstellen (optional aber empfohlen)
cat > .gitattributes << 'EOF'
* text=auto
*.sh text eol=lf
*.png binary
*.jpg binary
*.db binary
*.zip binary
*.json text eol=lf
*.md text eol=lf
Dockerfile text eol=lf
EOF

# Status checken
git status

# Alle Files adden
git add .

# Initial Commit
git commit -m "Initial commit: PixelBridge v1.0.0

Features:
- ROM library management with grid view
- Auto-fetch metadata from IGDB API
- Cover art download and caching
- Platform-based organization (25+ platforms)
- Complete RetroArch sync workflow
- Favorites system with heart icons
- Settings modal for Apple TV IP configuration
- Connection status monitoring (READY PLAYER 1)
- Save game backup and restore
- Docker Compose deployment
- SQLite database
- React + Vite frontend
- Node.js + Express backend
- Nginx reverse proxy
- Mobile-friendly (accessible via IP address)
- Comprehensive documentation

Tech Stack:
- Frontend: React 18, Vite, TanStack Query, Zustand, react-hot-toast
- Backend: Node.js 18, Express, SQLite (better-sqlite3), Multer
- Deployment: Docker + Docker Compose + Nginx
- APIs: IGDB (Twitch), RetroArch WebUI"

# Remote hinzufügen (ERSETZE yourusername!)
git remote add origin https://github.com/yourusername/pixelbridge.git

# Pushen
git push -u origin main
```

### Nach dem Push

1. **Repository Settings**:
   - About: Description hinzufügen
   - Topics: retro-gaming, retroarch, rom-manager, apple-tv, docker, react, nodejs
   - Website: (optional)

2. **README Badges hinzufügen** (optional):
   ```markdown
   ![Docker](https://img.shields.io/badge/docker-ready-blue?logo=docker)
   ![License](https://img.shields.io/badge/license-MIT-green)
   ![Node](https://img.shields.io/badge/node-18-brightgreen?logo=node.js)
   ![React](https://img.shields.io/badge/react-18-61DAFB?logo=react)
   ```

3. **Social Preview Image** (optional):
   - Settings → Social preview
   - Upload: frontend/public/logo-banner.png (oder custom 1280x640px)

4. **Issues & Discussions aktivieren**:
   - Settings → Features
   - Issues: ✅
   - Discussions: ✅ (optional, gut für Q&A)

---

## 📝 IGDB Credentials (Erinnerung)

### Was ist IGDB?

Internet Game Database - liefert:
- Game Metadata (Titel, Beschreibung, Genre)
- Cover Art
- Publisher, Developer
- Release Dates
- Ratings

### Wie bekomme ich Credentials?

**Quick Method**:
```bash
./get-igdb-token.sh
```

**Manual Method**:
1. https://dev.twitch.tv/console
2. Login mit Twitch Account
3. "Register Your Application"
4. Name: PixelBridge IGDB
5. OAuth Redirect: http://localhost
6. Category: Application Integration
7. "Create"
8. "Manage" → Client ID kopieren
9. "New Secret" → Client Secret kopieren
10. Token generieren:
   ```bash
   curl -X POST 'https://id.twitch.tv/oauth2/token' \
     -d 'client_id=CLIENT_ID' \
     -d 'client_secret=CLIENT_SECRET' \
     -d 'grant_type=client_credentials'
   ```
11. `access_token` aus Response kopieren
12. In `.env` eintragen

### Token Gültigkeit

- **Läuft ab**: Nach ~60 Tagen
- **Symptom**: Metadata wird nicht mehr geladen
- **Fix**: Neuen Token generieren mit Script

---

## 🛠️ Nützliche Commands

### Docker

```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# Rebuild
docker-compose up -d --build

# Logs
docker-compose logs -f
docker-compose logs backend
docker-compose logs frontend

# Status
docker-compose ps

# In Container Shell
docker exec -it pixelbridge-backend sh
docker exec -it pixelbridge-frontend sh

# Volumes löschen (⚠️ LÖSCHT DATEN!)
docker-compose down -v

# System aufräumen
docker system prune -a --volumes
```

### Backup

```bash
# Storage Backup
docker run --rm -v pixelbridge-storage:/data \
  -v $(pwd):/backup alpine \
  tar czf /backup/storage-backup-$(date +%Y%m%d).tar.gz /data

# Database Backup
docker run --rm -v pixelbridge-database:/data \
  -v $(pwd):/backup alpine \
  tar czf /backup/database-backup-$(date +%Y%m%d).tar.gz /data

# Restore Storage
docker run --rm -v pixelbridge-storage:/data \
  -v $(pwd):/backup alpine \
  tar xzf /backup/storage-backup-DATUM.tar.gz -C /

# Restore Database
docker run --rm -v pixelbridge-database:/data \
  -v $(pwd):/backup alpine \
  tar xzf /backup/database-backup-DATUM.tar.gz -C /
```

### Git

```bash
# Status
git status

# Änderungen anzeigen
git diff

# Commit
git add .
git commit -m "Beschreibung"

# Push
git push

# Pull
git pull

# Branch erstellen
git checkout -b feature/neue-funktion

# Branch wechseln
git checkout main

# Merge
git merge feature/neue-funktion

# Tag erstellen
git tag -a v1.0.0 -m "Release 1.0.0"
git push --tags
```

---

## 🔜 Roadmap (Future Features)

### v1.1 (Geplant)
- [ ] Manual Metadata Editing
- [ ] Batch Delete/Favorite
- [ ] Search Functionality
- [ ] Screenshot Management
- [ ] Play Count Tracking

### v1.2
- [ ] Multi-Device Support
- [ ] Cloud Backup Integration
- [ ] Custom Playlists
- [ ] Achievement System

### Security Enhancements (Wichtig!)
- [ ] API Key Authentifizierung
- [ ] Rate Limiting aktivieren
- [ ] SQL Injection Fixes
- [ ] Path Traversal Prevention
- [ ] Docker Secrets

---

## 📞 Support & Community

### Dokumentation
- **README.md** - Installation & Setup
- **USER_GUIDE.md** - Benutzer-Anleitung
- **GITHUB_INFO.md** - Repository Setup

### Issues & Bugs
- GitHub Issues: https://github.com/yourusername/pixelbridge/issues
- Immer Logs mitschicken!
- Schritte zum Reproduzieren beschreiben

### Beitragen
- Fork → Feature Branch → Pull Request
- Code Style beachten
- Tests schreiben (wenn möglich)
- Dokumentation updaten

---

## 📄 Lizenz

MIT License - Frei nutzbar, modifizierbar, kommerziell einsetzbar.

Siehe `LICENSE` file für Details.

---

## 🙏 Credits

- **IGDB** (Twitch) - Game Metadata
- **RetroArch Team** - Emulation Platform
- **Libretro** - Core Development
- **Press Start 2P Font** - Pixel Art Typography
- **React Team** - Frontend Framework
- **Node.js Team** - Backend Runtime
- **Docker Inc.** - Container Platform

---

**PixelBridge - Bridge your retro gaming library to the modern era 🎮✨**

*Last Updated: January 2026*
