/**
 * Home Page - ROM Library
 */

import { useState, useEffect, useCallback } from 'react';
import { romApi, platformApi, retroarchApi } from '../api';
import RomCard from '../components/rom/RomCard';
import RomDetails from '../components/rom/RomDetails';
import { useConnectionStore } from '../store/connectionStore';
import toast from 'react-hot-toast';

export default function Home() {
  const [roms, setRoms] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [selectedRom, setSelectedRom] = useState(null);
  const [selectedRomIds, setSelectedRomIds] = useState([]); // For multi-selection
  const [pushing, setPushing] = useState(false);

  // Get connection status from global store
  const { online: isOnline } = useConnectionStore();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [romsData, platformsData] = await Promise.all([
        romApi.getRoms({ platform_id: selectedPlatform }),
        platformApi.getPlatforms(true),
      ]);
      setRoms(romsData.roms);

      // Sort platforms by ROM count (descending)
      const sortedPlatforms = platformsData.platforms.sort((a, b) =>
        (b.rom_count || 0) - (a.rom_count || 0)
      );
      setPlatforms(sortedPlatforms);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedPlatform]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Platform icon mapping
  const platformIcons = {
    'nes': '🎮',
    'snes': '🕹️',
    'n64': '🎯',
    'gb': '🔲',
    'gba': '📱',
    'nds': '📲',
    'psx': '💿',
    'ps2': '💽',
    'psp': '🎮',
    'genesis': '🔵',
    'sms': '🎰',
    'gg': '🎲',
    'saturn': '🪐',
    'dreamcast': '🌀',
    'atari2600': '👾',
    'atari7800': '🎯',
    'lynx': '🐱',
    'neogeo': '⚡',
    'tg16': '🌟',
    'ws': '💫',
    'wsc': '✨',
    'mame': '🕹️',
    'fba': '🎰'
  };

  const getPlatformIcon = (shortName) => {
    return platformIcons[shortName] || '🎮';
  };

  // Toggle ROM selection
  const toggleRomSelection = (romId) => {
    setSelectedRomIds(prev =>
      prev.includes(romId)
        ? prev.filter(id => id !== romId)
        : [...prev, romId]
    );
  };

  // Select all ROMs
  const selectAll = () => {
    setSelectedRomIds(roms.map(rom => rom.id));
  };

  // Deselect all ROMs
  const deselectAll = () => {
    setSelectedRomIds([]);
  };

  // Complete Sync Workflow with Apple TV
  const handlePushToAppleTV = async () => {
    if (selectedRomIds.length === 0) return;

    try {
      setPushing(true);

      // Check connection first
      toast.loading('🔍 Prüfe Apple TV Verbindung...', { id: 'sync' });
      const status = await retroarchApi.checkStatus();

      if (!status.online) {
        toast.error('❌ Apple TV ist nicht erreichbar! Bitte starte RetroArch.', { id: 'sync', duration: 5000 });
        setPushing(false);
        return;
      }

      // Start complete sync workflow
      toast.loading('🔄 PHASE 1/5: Sichere Spielstände...', { id: 'sync' });

      const result = await retroarchApi.syncWithRetroArch(selectedRomIds);

      if (result.success) {
        const log = result.log;

        // Build detailed success message
        const details = [
          `✅ SYNC ERFOLGREICH!`,
          ``,
          `📦 ${log.phase1_backup.saves.length} Spielstände gesichert`,
          `🗑️  ${log.phase2_cleanup.deletedRoms.length} alte ROMs gelöscht`,
          `⬆️  ${log.phase3_push.pushed.length} neue ROMs übertragen`,
          `📋 ${log.phase4_playlists.generated.length} Playlists generiert`,
          `💾 ${log.phase5_restore.restored.length} Spielstände wiederhergestellt`
        ];

        toast.success(details.join('\n'), {
          id: 'sync',
          duration: 8000
        });

        // Reload data to reflect changes
        loadData();
        deselectAll();
      } else {
        const errorMessages = result.log.errors.length > 0
          ? result.log.errors.join('\n')
          : 'Unbekannter Fehler';

        toast.error(`⚠️ Sync teilweise fehlgeschlagen:\n${errorMessages}`, {
          id: 'sync',
          duration: 8000
        });
      }
    } catch (error) {
      console.error('Sync error:', error);
      toast.error(`❌ Sync fehlgeschlagen: ${error.message}`, {
        id: 'sync',
        duration: 5000
      });
    } finally {
      setPushing(false);
    }
  };

  return (
    <div className="container">
      <div className="filters">
        <button
          className={!selectedPlatform ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setSelectedPlatform(null)}
        >
          🌍 All Platforms
        </button>
        {platforms.map((platform) => (
          <button
            key={platform.id}
            className={selectedPlatform === platform.id ? 'filter-btn active' : 'filter-btn'}
            onClick={() => setSelectedPlatform(platform.id)}
          >
            {getPlatformIcon(platform.short_name)} {platform.name} ({platform.rom_count || 0})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading">Loading ROMs...</div>
      ) : roms.length === 0 ? (
        <div className="empty-state">
          <h2>No ROMs found</h2>
          <p>Upload some ROMs to get started!</p>
        </div>
      ) : (
        <>
          {/* Selection Actions Bar */}
          {selectedRomIds.length > 0 && (
            <div className="selection-bar">
              <div className="selection-info">
                <span>{selectedRomIds.length} ROM(s) ausgewählt</span>
                <button className="selection-action-btn" onClick={deselectAll}>
                  Abwählen
                </button>
              </div>
              {isOnline ? (
                <button
                  className="push-btn"
                  onClick={handlePushToAppleTV}
                  disabled={pushing}
                >
                  {pushing ? '⏳ Pushe...' : `🚀 Push to Apple TV (${selectedRomIds.length})`}
                </button>
              ) : (
                <button className="push-btn disabled" disabled title="Apple TV ist offline">
                  ⚠️ Apple TV OFFLINE
                </button>
              )}
            </div>
          )}

          {/* Bulk Actions */}
          <div className="bulk-actions">
            <button className="bulk-action-btn" onClick={selectAll}>
              ✓ Alle auswählen
            </button>
          </div>

          <div className="rom-grid">
            {roms.map((rom) => (
              <RomCard
                key={rom.id}
                rom={rom}
                isSelected={selectedRomIds.includes(rom.id)}
                onSelect={toggleRomSelection}
                onInfo={setSelectedRom}
              />
            ))}
          </div>
        </>
      )}

      {selectedRom && (
        <RomDetails
          rom={selectedRom}
          onClose={() => setSelectedRom(null)}
          onDeleted={() => {
            setSelectedRom(null);
            loadData(); // Reload the list after deletion
          }}
        />
      )}
    </div>
  );
}
