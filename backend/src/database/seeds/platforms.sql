-- Platform seed data
-- Supports all major RetroArch cores

INSERT OR IGNORE INTO platforms (name, short_name, description, manufacturer, retroarch_core, supported_extensions) VALUES
-- Nintendo Systems
('Nintendo Entertainment System', 'nes', 'The iconic 8-bit gaming console from 1985', 'Nintendo', 'fceumm', '["' || '.nes' || '", "' || '.unf' || '", "' || '.zip' || '"]'),
('Super Nintendo', 'snes', '16-bit home video game console', 'Nintendo', 'snes9x', '["' || '.sfc' || '", "' || '.smc' || '", "' || '.zip' || '"]'),
('Nintendo 64', 'n64', '64-bit gaming console from 1996', 'Nintendo', 'mupen64plus_next', '["' || '.n64' || '", "' || '.z64' || '", "' || '.v64' || '", "' || '.zip' || '"]'),
('Game Boy', 'gb', 'Portable handheld gaming system', 'Nintendo', 'gambatte', '["' || '.gb' || '", "' || '.gbc' || '", "' || '.zip' || '"]'),
('Game Boy Advance', 'gba', 'Advanced 32-bit handheld console', 'Nintendo', 'mgba', '["' || '.gba' || '", "' || '.zip' || '"]'),
('Nintendo DS', 'nds', 'Dual-screen handheld gaming system', 'Nintendo', 'desmume', '["' || '.nds' || '", "' || '.zip' || '"]'),

-- Sony Systems
('PlayStation', 'psx', 'Original PlayStation console', 'Sony', 'pcsx_rearmed', '["' || '.bin' || '", "' || '.cue' || '", "' || '.img' || '", "' || '.iso' || '", "' || '.chd' || '"]'),
('PlayStation Portable', 'psp', 'Portable gaming handheld', 'Sony', 'ppsspp', '["' || '.iso' || '", "' || '.cso' || '", "' || '.pbp' || '", "' || '.chd' || '"]'),

-- Sega Systems
('Sega Genesis', 'genesis', 'Sega 16-bit console (Mega Drive)', 'Sega', 'genesis_plus_gx', '["' || '.md' || '", "' || '.smd' || '", "' || '.gen' || '", "' || '.bin' || '", "' || '.zip' || '"]'),
('Sega Master System', 'sms', 'Sega 8-bit console', 'Sega', 'genesis_plus_gx', '["' || '.sms' || '", "' || '.zip' || '"]'),
('Sega Game Gear', 'gamegear', 'Sega portable handheld', 'Sega', 'genesis_plus_gx', '["' || '.gg' || '", "' || '.zip' || '"]'),
('Sega Saturn', 'saturn', 'Sega 32-bit console', 'Sega', 'yabause', '["' || '.cue' || '", "' || '.iso' || '", "' || '.chd' || '"]'),
('Sega Dreamcast', 'dreamcast', 'Last Sega home console', 'Sega', 'flycast', '["' || '.cdi' || '", "' || '.gdi' || '", "' || '.chd' || '"]'),

-- Atari Systems
('Atari 2600', 'atari2600', 'Classic Atari console', 'Atari', 'stella', '["' || '.a26' || '", "' || '.bin' || '", "' || '.zip' || '"]'),
('Atari 7800', 'atari7800', 'Advanced Atari console', 'Atari', 'prosystem', '["' || '.a78' || '", "' || '.bin' || '", "' || '.zip' || '"]'),
('Atari Lynx', 'lynx', 'Atari handheld gaming system', 'Atari', 'handy', '["' || '.lnx' || '", "' || '.zip' || '"]'),

-- Other Systems
('Neo Geo', 'neogeo', 'SNK arcade system', 'SNK', 'fbneo', '["' || '.zip' || '"]'),
('Neo Geo Pocket', 'ngp', 'SNK handheld console', 'SNK', 'mednafen_ngp', '["' || '.ngp' || '", "' || '.ngc' || '", "' || '.zip' || '"]'),
('TurboGrafx-16', 'pcengine', 'NEC PC Engine/TurboGrafx-16', 'NEC', 'mednafen_pce', '["' || '.pce' || '", "' || '.cue' || '", "' || '.ccd' || '", "' || '.chd' || '", "' || '.zip' || '"]'),
('WonderSwan', 'wonderswan', 'Bandai handheld console', 'Bandai', 'mednafen_wswan', '["' || '.ws' || '", "' || '.wsc' || '", "' || '.zip' || '"]'),
('Virtual Boy', 'virtualboy', 'Nintendo 3D gaming system', 'Nintendo', 'mednafen_vb', '["' || '.vb' || '", "' || '.vboy' || '", "' || '.zip' || '"]'),

-- Arcade
('MAME', 'mame', 'Multiple Arcade Machine Emulator', 'Various', 'mame', '["' || '.zip' || '"]'),
('FinalBurn Neo', 'fbneo', 'Arcade emulator', 'Various', 'fbneo', '["' || '.zip' || '"]');
