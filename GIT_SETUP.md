# Git Setup & GitHub Deployment Guide

## 🚀 Quick Start (Copy & Paste)

### 1. Xcode License akzeptieren

```bash
sudo xcodebuild -license
# Dann: agree eingeben und Enter drücken
```

### 2. Git konfigurieren

```bash
# Deine Infos eintragen
git config --global user.name "Dein Name"
git config --global user.email "deine@email.com"

# Prüfen ob es funktioniert hat
git config --list | grep user
```

### 3. GitHub Repository erstellen

1. Gehe zu: https://github.com/new
2. **Repository Name**: `pixelbridge`
3. **Description**:
   ```
   🎮 Modern ROM library manager that bridges your retro gaming collection to RetroArch on Apple TV. Auto-fetch metadata, manage favorites, and sync with one click.
   ```
4. **Visibility**: Public (oder Private wenn gewünscht)
5. ⚠️ **NICHT** "Initialize with README" anklicken (haben wir schon!)
6. Klicke **"Create repository"**
7. **WICHTIG**: Kopiere die Repository URL (z.B. `https://github.com/DEINNAME/pixelbridge.git`)

### 4. Lokales Repository initialisieren

```bash
cd /path/to/pixelbridge

# Git initialisieren
git init

# Main branch erstellen
git branch -M main

# .gitattributes erstellen (für korrekte Line Endings)
cat > .gitattributes << 'EOF'
# Auto detect text files
* text=auto

# Force LF for shell scripts
*.sh text eol=lf

# Binary files
*.png binary
*.jpg binary
*.jpeg binary
*.gif binary
*.ico binary
*.db binary
*.sqlite binary

# Archives
*.zip binary
*.7z binary
*.nes binary
*.snes binary
*.sfc binary
*.gba binary
*.iso binary

# Force LF for config files
*.json text eol=lf
*.md text eol=lf
*.yml text eol=lf
*.yaml text eol=lf
Dockerfile text eol=lf
EOF

# Status checken (siehst du alle Dateien)
git status
```

### 5. Initial Commit

```bash
# Alle Dateien hinzufügen
git add .

# Status nochmal checken (sollte alles grün sein)
git status

# Initial Commit mit ausführlicher Message
git commit -m "Initial commit: PixelBridge v1.0.0

🎮 Modern ROM Library Manager for RetroArch on Apple TV

Features:
- ROM library management with grid view and platform filtering
- Auto-fetch metadata from IGDB API (covers, descriptions, ratings)
- Automatic cover art download and caching
- Platform-based organization (25+ retro gaming platforms)
- Complete RetroArch sync workflow with 5 phases:
  * Save game backup from Apple TV
  * Clean ROM and playlist directories
  * Upload selected ROMs
  * Generate RetroArch playlists
  * Restore save games
- Favorites system with heart icons
- Save game indicator (diskette icon)
- Settings modal for Apple TV IP configuration
- Connection status monitoring (READY PLAYER 1)
- Docker Compose deployment with persistent volumes
- SQLite database with better-sqlite3
- React 18 + Vite frontend with pixel-art theme
- Node.js 18 + Express backend
- Nginx reverse proxy
- Mobile-friendly (accessible via IP address)
- Local network CORS support
- Comprehensive documentation (README, USER_GUIDE)

Tech Stack:
- Frontend: React 18, Vite, TanStack Query, Zustand, react-hot-toast, react-dropzone
- Backend: Node.js 18, Express, SQLite (better-sqlite3), Multer, Axios
- Deployment: Docker + Docker Compose + Nginx
- APIs: IGDB (Twitch), RetroArch WebUI
- Security: Helmet, CORS, input validation

Components:
- 25+ platform support (NES, SNES, PSX, N64, GBA, etc.)
- Auto-detect file extensions and platforms
- ZIP/7z extraction support
- 4GB file size limit (for PSP ISOs)
- Persistent Docker volumes for data
- Health checks and auto-restart
- Pixel art UI with Press Start 2P font
- Responsive design for mobile access

Documentation:
- README.md - Installation & deployment
- USER_GUIDE.md - Complete user manual
- DEPLOYMENT_SUMMARY.md - Deployment guide
- GITHUB_INFO.md - Repository setup
- Code review report included"
```

### 6. Remote Repository verbinden

```bash
# ⚠️ WICHTIG: Ersetze DEINNAME mit deinem GitHub Username!
git remote add origin https://github.com/DEINNAME/pixelbridge.git

# Prüfen ob Remote korrekt ist
git remote -v
```

### 7. Push zu GitHub

```bash
# Ersten Push (mit -u für upstream tracking)
git push -u origin main

# Bei Problemen mit Authentication:
# GitHub verwendet jetzt Personal Access Tokens statt Passwörter
# Gehe zu: https://github.com/settings/tokens
# Generiere neuen Token mit "repo" scope
# Benutze Token statt Passwort beim Push
```

---

## 🎨 GitHub Repository Einrichten

### Nach dem Push

1. **Gehe zu deinem Repository**: https://github.com/DEINNAME/pixelbridge

2. **About Section konfigurieren**:
   - Klicke auf ⚙️ (Settings/Zahnrad) neben "About"
   - **Description**:
     ```
     Modern web-based ROM library manager with automatic IGDB metadata, cover art, and one-click sync to RetroArch on Apple TV
     ```
   - **Website**: (optional) leer lassen oder eigene URL
   - **Topics** (Tags) hinzufügen:
     ```
     retro-gaming
     retroarch
     rom-manager
     apple-tv
     emulation
     game-library
     igdb
     react
     nodejs
     docker
     homebrew
     playlist-generator
     save-games
     metadata
     pixel-art
     ```
   - ✅ Klicke "Save changes"

3. **Repository Settings** (oben rechts: Settings):

   **General**:
   - Default branch: `main` ✅
   - Features:
     - ✅ Issues (für Bug Reports)
     - ❌ Wiki (nutzen docs/ folder)
     - ✅ Discussions (optional, für Q&A)
     - ❌ Projects (noch nicht nötig)

   **Security**:
   - ✅ Private vulnerability reporting
   - ✅ Dependency graph
   - ✅ Dependabot alerts
   - ✅ Dependabot security updates

4. **Social Preview Image** (optional):
   - Settings → Social preview
   - Upload: `frontend/public/logo-banner-transparent.png`
   - Oder erstelle 1280x640px custom image

5. **README Badges hinzufügen** (optional):

   Öffne README.md und füge nach dem Logo-Banner ein:
   ```markdown
   ![Docker](https://img.shields.io/badge/docker-ready-blue?logo=docker)
   ![License](https://img.shields.io/badge/license-MIT-green)
   ![Node](https://img.shields.io/badge/node-18-brightgreen?logo=node.js)
   ![React](https://img.shields.io/badge/react-18-61DAFB?logo=react)
   ![Platform](https://img.shields.io/badge/platform-apple%20tv-black?logo=apple)
   ```

---

## 📝 Zukünftige Updates pushen

### Workflow für Änderungen

```bash
# Status checken
git status

# Geänderte Dateien ansehen
git diff

# Alle Änderungen stagen
git add .

# Oder spezifische Dateien
git add backend/src/controllers/romController.js
git add frontend/src/components/rom/RomCard.jsx

# Commit mit aussagekräftiger Message
git commit -m "Add: Neue Feature X

- Feature beschreibung
- Was wurde geändert
- Warum wurde es geändert"

# Push zu GitHub
git push
```

### Gute Commit Messages

**Format**:
```
[Type]: Kurzbeschreibung (max 50 Zeichen)

- Längere Beschreibung wenn nötig
- Aufzählung von Änderungen
- Bezug zu Issues (#123)
```

**Types**:
- `Add:` - Neue Features
- `Fix:` - Bug Fixes
- `Update:` - Verbesserungen an bestehendem Code
- `Refactor:` - Code Umstrukturierung
- `Docs:` - Dokumentation
- `Style:` - Formatierung, CSS
- `Test:` - Tests hinzugefügt
- `Chore:` - Maintenance (Dependencies, Build)

**Beispiele**:
```bash
git commit -m "Add: Manual metadata editing feature

- Add edit button to ROM details modal
- Create metadata edit form component
- Implement PUT /api/roms/:id/metadata endpoint
- Update ROM model with validation

Closes #42"
```

```bash
git commit -m "Fix: Logo transparency issue

- Change Header.jsx to use logo-banner-transparent.png
- Update README and USER_GUIDE logo references
- Fixes #15"
```

---

## 🌿 Branching Strategy (Optional)

### Feature Branches

```bash
# Neue Feature Branch erstellen
git checkout -b feature/metadata-editing

# Arbeiten...
git add .
git commit -m "Add: Metadata editing UI"

# Zu main zurück
git checkout main

# Feature Branch mergen
git merge feature/metadata-editing

# Branch löschen
git branch -d feature/metadata-editing

# Push
git push
```

### Hotfix für Production

```bash
# Hotfix Branch
git checkout -b hotfix/sql-injection-fix

# Fix implementieren
git add .
git commit -m "Fix: SQL injection vulnerability in sort params

- Add whitelist validation for sort_by parameter
- Add whitelist validation for sort_order parameter
- Update Rom model with ALLOWED_SORT_COLUMNS constant

SECURITY FIX - Critical"

# Mergen und pushen
git checkout main
git merge hotfix/sql-injection-fix
git push
git branch -d hotfix/sql-injection-fix
```

---

## 🏷️ Tags & Releases

### Version Tags erstellen

```bash
# Tag für Release
git tag -a v1.0.0 -m "Release 1.0.0 - Initial Release

Features:
- ROM library management
- IGDB metadata integration
- Apple TV sync workflow
- Docker deployment
- Complete documentation"

# Tag pushen
git push --tags

# Tags anzeigen
git tag -l
```

### GitHub Release erstellen

1. Gehe zu: https://github.com/DEINNAME/pixelbridge/releases
2. Klicke **"Create a new release"**
3. **Choose a tag**: v1.0.0
4. **Release title**: `PixelBridge v1.0.0 - Initial Release`
5. **Describe this release**:
   ```markdown
   # PixelBridge v1.0.0 🎮✨

   First stable release of PixelBridge - Modern ROM Library Manager for RetroArch on Apple TV.

   ## ✨ Features

   - 📚 ROM library management with grid view
   - 🎨 Auto-fetch metadata from IGDB (covers, descriptions)
   - 🔄 Complete Apple TV sync workflow (5 phases)
   - 💾 Automatic save game backup/restore
   - ⭐ Favorites system
   - 📋 Auto-generated RetroArch playlists
   - 🐳 Docker-ready deployment
   - 📱 Mobile-friendly (accessible via IP)

   ## 📦 Installation

   See [README.md](README.md) for detailed instructions.

   Quick start:
   ```bash
   git clone https://github.com/DEINNAME/pixelbridge.git
   cd pixelbridge
   cp .env.example .env
   # Edit .env with your IGDB credentials
   ./start.sh
   ```

   ## 🔒 Security Notes

   This release is intended for **local network use only**. Do not expose to public internet without implementing authentication.

   ## 📖 Documentation

   - [README.md](README.md) - Installation & Setup
   - [USER_GUIDE.md](USER_GUIDE.md) - Complete User Guide
   - [DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md) - Deployment Guide

   ## Known Issues

   See [Issues](https://github.com/DEINNAME/pixelbridge/issues) for bug reports and feature requests.
   ```
6. Klicke **"Publish release"**

---

## 🔄 .gitignore Überprüfen

Stelle sicher dass `.gitignore` diese Einträge hat:

```bash
cat .gitignore
```

Sollte enthalten:
```gitignore
# Environment
.env
.env.local

# Dependencies
node_modules/

# Storage (user data)
backend/storage/roms/*
backend/storage/covers/*
backend/storage/metadata/*
backend/storage/saves/*
backend/database/*.db

# Logs
*.log

# OS
.DS_Store
```

---

## ✅ Checkliste vor dem Push

- [ ] Xcode License akzeptiert
- [ ] Git konfiguriert (name, email)
- [ ] `.env` NICHT in Git (in .gitignore!)
- [ ] IGDB Credentials in `.env` NICHT in `.env.example`
- [ ] Alle sensiblen Daten entfernt
- [ ] Code funktioniert lokal
- [ ] Docker Build erfolgreich
- [ ] README.md aktuell
- [ ] Commit Message aussagekräftig
- [ ] Remote URL korrekt

---

## 🆘 Troubleshooting

### Problem: "xcrun: error: invalid active developer path"

```bash
# Xcode Command Line Tools installieren
xcode-select --install
```

### Problem: "fatal: not a git repository"

```bash
# In richtiges Verzeichnis wechseln
cd /path/to/pixelbridge

# Git initialisieren
git init
```

### Problem: "remote: Support for password authentication was removed"

GitHub akzeptiert keine Passwörter mehr. Nutze Personal Access Token:

1. Gehe zu: https://github.com/settings/tokens
2. Klicke **"Generate new token (classic)"**
3. **Note**: "PixelBridge CLI Access"
4. **Expiration**: 90 days (oder länger)
5. **Select scopes**: ✅ `repo` (alle Sub-Checkboxes)
6. Klicke **"Generate token"**
7. **WICHTIG**: Token kopieren (wird nur einmal angezeigt!)
8. Bei `git push` → Username: dein GitHub Name, Password: TOKEN

### Problem: "! [rejected] main -> main (fetch first)"

```bash
# Remote Änderungen holen
git pull origin main

# Merge conflicts lösen falls nötig
# Dann erneut pushen
git push origin main
```

### Problem: ".env wurde committed!"

```bash
# Aus Git History entfernen
git rm --cached .env
git commit -m "Remove .env from git"
git push

# WICHTIG: Credentials rotieren!
# Neue IGDB Token generieren
# .env mit neuen Credentials aktualisieren
```

---

## 📚 Weitere Git Ressourcen

- **Git Basics**: https://git-scm.com/book/en/v2
- **GitHub Guides**: https://guides.github.com/
- **Commit Message Guide**: https://chris.beams.io/posts/git-commit/
- **Git Cheat Sheet**: https://education.github.com/git-cheat-sheet-education.pdf

---

**Bereit für GitHub! 🚀**

Nach dem Push ist dein Projekt öffentlich sichtbar und andere können:
- Code ansehen
- Issues erstellen
- Pull Requests einreichen
- Das Projekt forken
- Stars geben ⭐

Viel Erfolg! 🎮✨
