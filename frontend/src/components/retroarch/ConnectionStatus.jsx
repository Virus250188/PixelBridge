/**
 * Apple TV Connection Status Component
 */

import { useEffect, useState } from 'react';
import { useConnectionStore } from '../../store/connectionStore';
import SettingsModal from '../settings/SettingsModal';

export default function ConnectionStatus() {
  const { online, checking, device, checkConnection } = useConnectionStore();
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    // Initial check
    checkConnection();

    // Check every 30 seconds
    const interval = setInterval(checkConnection, 30000);

    return () => clearInterval(interval);
  }, [checkConnection]);

  const handleStatusClick = () => {
    // Only open settings if offline
    if (!online && !checking) {
      setShowSettings(true);
    }
  };

  return (
    <>
      <div
        className={`connection-status ${online ? 'online' : 'offline'} ${!online && !checking ? 'clickable' : ''}`}
        onClick={handleStatusClick}
        title={!online && !checking ? 'Klicken um IP-Adresse zu konfigurieren' : ''}
      >
        <div className="status-indicator">
          <div className="status-dot"></div>
          <span className="status-text">
            {checking ? (
              'CHECKING...'
            ) : online ? (
              'READY PLAYER 1'
            ) : (
              'OFFLINE'
            )}
          </span>
        </div>
        {online && (
          <div className="status-device">
            <span className="device-icon">📺</span>
            <span className="device-name">{device}</span>
          </div>
        )}
      </div>

      {showSettings && (
        <SettingsModal onClose={() => setShowSettings(false)} />
      )}
    </>
  );
}
