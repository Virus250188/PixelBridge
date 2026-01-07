# PixelBridge Unraid Setup

## Docker Container Konfiguration

### Image
```
deinrepo/pixelbridge:latest
```

### Container Name
```
pixelbridge
```

### Network Type
```
Bridge
```

### Ports
- **Container Port**: 80 → **Host Port**: 1234 (oder dein gewünschter Port)

### Volume Mappings
```
Container path: /app/backend/storage
Host path: /mnt/user/appdata/pixelbridge/
```

### Environment Variables

**Du musst nur STORAGE_PATH setzen - alle anderen Pfade werden automatisch abgeleitet!**

#### Erforderliche Variablen:

```bash
# Storage Path (EINZIGE Pfad-Variable die du setzen musst!)
STORAGE_PATH=/app/backend/storage

# RetroArch Apple TV
RETROARCH_IP=192.168.x.x
RETROARCH_PORT=80

# IGDB API Credentials
IGDB_CLIENT_ID=your_client_id
IGDB_CLIENT_SECRET=your_client_secret
```

#### Optionale Variablen (haben sinnvolle Defaults):

```bash
# Server Config (Optional)
NODE_ENV=production
PORT=3000

# File Limits (Optional)
MAX_FILE_SIZE=4294967296
ALLOWED_EXTENSIONS=.nes,.snes,.sfc,.gb,.gbc,.gba,.iso,.bin,.cue,.smd,.md,.gen,.gg,.cdi,.gdi,.zip,.7z

# CORS (Optional)
CORS_ORIGIN=http://localhost
```

**Automatisch abgeleitete Pfade** (NICHT setzen!):
- `DATABASE_PATH` → `/app/backend/storage/database/retroarch.db`
- `ROMS_PATH` → `/app/backend/storage/roms`
- `COVERS_PATH` → `/app/backend/storage/covers`
- `METADATA_PATH` → `/app/backend/storage/metadata`

## Bestehenden Container aktualisieren

### Option 1: Über Unraid Web UI
1. Gehe zu Docker Tab
2. Stoppe den Container
3. Klicke auf "Edit" beim Container
4. Füge die Umgebungsvariablen hinzu (siehe oben)
5. Speichern und starten

### Option 2: Über SSH
```bash
# Container stoppen und löschen (Daten bleiben in /mnt/user/appdata/pixelbridge/)
docker stop pixelbridge2 && docker rm pixelbridge2

# Neuen Container starten (nur 3 Variablen erforderlich!)
docker run -d \
  --name pixelbridge2 \
  --restart unless-stopped \
  -p 1234:80 \
  -v /mnt/user/appdata/pixelbridge/:/app/backend/storage \
  -e STORAGE_PATH=/app/backend/storage \
  -e RETROARCH_IP=192.168.x.x \
  -e IGDB_CLIENT_ID=deine_client_id \
  -e IGDB_CLIENT_SECRET=dein_client_secret \
  virus250188/pixelbridge:latest
```

## Verzeichnisstruktur

Nach dem ersten Start sollte folgende Struktur existieren:

```
/mnt/user/appdata/pixelbridge/
├── database/
│   └── retroarch.db
├── roms/
│   ├── nes/
│   ├── snes/
│   ├── gba/
│   └── ...
├── covers/
│   └── rom_1_cover.jpg
├── metadata/
├── saves/
├── temp/
└── screenshots/
```

## Troubleshooting

### Covers zeigen 404
**Ursache**: `STORAGE_PATH` fehlt oder zeigt auf falschen Pfad

**Lösung**: Stelle sicher dass `STORAGE_PATH=/app/backend/storage` gesetzt ist

### Datenbank geht nach Restart verloren
**Ursache**: `STORAGE_PATH` fehlt

**Lösung**: `STORAGE_PATH=/app/backend/storage` setzen

### ROMs werden nicht automatisch erkannt
**Ursache**: ROMs liegen nicht im richtigen Unterordner

**Lösung**: ROMs müssen in `/mnt/user/appdata/pixelbridge/roms/PLATFORM/` liegen (z.B. `roms/nes/game.nes`)
