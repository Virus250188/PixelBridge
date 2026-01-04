# GitHub Repository Info

## Repository Name
`pixelbridge`

## Description (Short)
🎮 Modern ROM library manager that bridges your retro gaming collection to RetroArch on Apple TV. Auto-fetch metadata, manage favorites, and sync with one click.

## Topics/Tags
- retroarch
- retro-gaming
- rom-manager
- apple-tv
- emulation
- game-library
- igdb
- react
- nodejs
- docker
- homebrew
- rom-collection
- playlist-generator
- save-games
- metadata

## About Section
```
PixelBridge - Modern web-based ROM library manager with automatic IGDB metadata,
cover art, and one-click sync to RetroArch on Apple TV. Built with React, Node.js,
and Docker for easy deployment.
```

## Website (Optional)
Leave empty or add: https://yourusername.github.io/pixelbridge

## Features List (for README)
✨ Multi-platform ROM support (25+ systems)
📚 Automatic metadata from IGDB (covers, descriptions, ratings)
🔄 Complete sync workflow with save game backup/restore
💾 Smart save game management
📋 Auto-generated RetroArch playlists
⭐ Favorites system
🎨 Retro pixel-art UI
🐳 Docker-ready deployment
📱 Mobile-friendly (access from phone/tablet)
🔒 Local network only (privacy-first)

## License
MIT License

## Initial Commit Message
```
Initial commit: PixelBridge v1.0.0

Features:
- ROM library management with grid view
- Auto-fetch metadata from IGDB API
- Cover art download and caching
- Platform-based organization (25+ platforms)
- Complete RetroArch sync workflow:
  * Save game backup
  * ROM upload
  * Playlist generation
  * Save game restore
- Favorites system
- Settings modal for Apple TV IP configuration
- Connection status monitoring
- Docker Compose deployment
- SQLite database
- React + Vite frontend
- Node.js + Express backend
- Nginx reverse proxy
- Comprehensive documentation (README, USER_GUIDE)

Security:
- Helmet middleware
- CORS configuration for local network
- Input validation
- File upload limits
- SQLite parameterized queries

Tech Stack:
- Frontend: React 18, Vite, TanStack Query, Zustand
- Backend: Node.js 18, Express, SQLite (better-sqlite3)
- Deployment: Docker + Docker Compose
- API: IGDB (Twitch), RetroArch WebUI
```

## .gitattributes (Recommended)
Create this file to handle line endings and binary files properly:

```gitattributes
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
```

## GitHub Actions CI/CD (Optional Future Enhancement)
Location: `.github/workflows/docker-publish.yml`

Basic workflow to test builds:
```yaml
name: Docker Build Test

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Build backend
        run: docker build ./backend

      - name: Build frontend
        run: docker build ./frontend

      - name: Test docker-compose
        run: docker-compose config
```

## GitHub Repository Settings

### General
- Default branch: `main`
- Issues: Enabled
- Projects: Disabled (for now)
- Wiki: Disabled (use docs/ folder instead)
- Discussions: Optional (good for Q&A)

### Security
- Private vulnerability reporting: Enabled
- Dependency graph: Enabled
- Dependabot alerts: Enabled
- Dependabot security updates: Enabled

### Branches
- Branch protection for `main`:
  * Require pull request reviews (if collaborating)
  * Require status checks to pass
  * No force pushes
  * No deletions

## Issue Templates (Optional)

Create `.github/ISSUE_TEMPLATE/bug_report.md`:
```markdown
---
name: Bug Report
about: Report a bug or issue
---

**Describe the bug**
A clear description of the bug.

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What should happen.

**Screenshots**
If applicable.

**Environment:**
- OS: [e.g., macOS 14]
- Docker version:
- Browser:

**Logs**
```
docker-compose logs
```

**Additional context**
Any other info.
```

## Star History
Once published, add to README:
```markdown
## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=yourusername/pixelbridge&type=Date)](https://star-history.com/#yourusername/pixelbridge&Date)
```

## Badges for README
Add at top of README.md:
```markdown
![Docker](https://img.shields.io/badge/docker-ready-blue?logo=docker)
![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-18-brightgreen?logo=node.js)
![React](https://img.shields.io/badge/react-18-61DAFB?logo=react)
![Platform](https://img.shields.io/badge/platform-apple%20tv-black?logo=apple)
```

## Social Preview Image
Recommended size: 1280x640px

Use the banner: `frontend/public/logo-banner.png` or create a custom one showing:
- PixelBridge logo
- Screenshot of ROM grid
- Apple TV icon
- RetroArch icon
- Text: "Bridge your ROMs to RetroArch"

## Contributors Guide (CONTRIBUTING.md)
```markdown
# Contributing to PixelBridge

Thank you for your interest!

## How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Development Setup

See [README.md](README.md#development) for local development setup.

## Code Style

- ESLint for JavaScript
- 2 spaces indentation
- Descriptive variable names
- Comments for complex logic

## Commit Messages

- Use present tense ("Add feature" not "Added feature")
- Use imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit first line to 72 characters

## Pull Request Process

1. Update README.md with details of changes
2. Update USER_GUIDE.md if adding user-facing features
3. Test Docker build works
4. Request review from maintainer

## Bug Reports

Use GitHub Issues with bug report template.

## Feature Requests

Use GitHub Issues describing:
- Problem it solves
- Proposed solution
- Alternatives considered

## Questions

Open a GitHub Issue with "Question:" prefix or use Discussions.

Thank you! 🎮
```
