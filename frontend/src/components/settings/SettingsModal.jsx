/**
 * Settings Modal Component
 * Configure Apple TV connection settings
 */

import { useState, useEffect } from 'react';
import { settingsApi } from '../../api';
import { useConnectionStore } from '../../store/connectionStore';
import toast from 'react-hot-toast';

export default function SettingsModal({ onClose }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    retroarch_ip: '',
    retroarch_port: '80'
  });

  const { checkConnection } = useConnectionStore();

  // Load current settings
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await settingsApi.getSettings();
      setSettings({
        retroarch_ip: data.settings.retroarch_ip || '192.168.1.100',
        retroarch_port: data.settings.retroarch_port || '80'
      });
    } catch (error) {
      toast.error(`Fehler beim Laden der Einstellungen: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!settings.retroarch_ip.trim()) {
      toast.error('❌ IP-Adresse darf nicht leer sein');
      return;
    }

    const port = parseInt(settings.retroarch_port);
    if (isNaN(port) || port < 1 || port > 65535) {
      toast.error('❌ Ungültiger Port (1-65535)');
      return;
    }

    try {
      setSaving(true);
      await settingsApi.updateSettings(settings);
      toast.success('✅ Einstellungen gespeichert');

      // Trigger connection check with new settings
      setTimeout(() => {
        checkConnection();
      }, 500);

      onClose();
    } catch (error) {
      toast.error(`❌ Fehler beim Speichern: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    try {
      toast.loading('🔍 Teste Verbindung...', { id: 'test' });

      // Save settings first, then test
      await settingsApi.updateSettings(settings);
      await checkConnection();

      toast.success('✅ Verbindung erfolgreich!', { id: 'test', duration: 3000 });
    } catch (error) {
      toast.error(`❌ Verbindung fehlgeschlagen: ${error.message}`, { id: 'test', duration: 5000 });
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content settings-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <div className="modal-header">
          <h2 className="modal-title">⚙️ Apple TV Einstellungen</h2>
        </div>

        <div className="modal-body">
          {loading ? (
            <div className="loading">Lade Einstellungen...</div>
          ) : (
            <form onSubmit={handleSave} className="settings-form">
              <div className="form-group">
                <label htmlFor="retroarch_ip" className="form-label">
                  📺 Apple TV IP-Adresse
                </label>
                <input
                  type="text"
                  id="retroarch_ip"
                  name="retroarch_ip"
                  className="form-input"
                  value={settings.retroarch_ip}
                  onChange={handleChange}
                  placeholder="192.168.1.100"
                  required
                />
                <p className="form-hint">
                  Die IP-Adresse deines Apple TV im lokalen Netzwerk
                </p>
              </div>

              <div className="form-group">
                <label htmlFor="retroarch_port" className="form-label">
                  🔌 Port
                </label>
                <input
                  type="number"
                  id="retroarch_port"
                  name="retroarch_port"
                  className="form-input"
                  value={settings.retroarch_port}
                  onChange={handleChange}
                  placeholder="80"
                  min="1"
                  max="65535"
                  required
                />
                <p className="form-hint">
                  Standard: 80 (HTTP WebUI)
                </p>
              </div>

              <div className="info-box">
                <h3>💡 Hilfe</h3>
                <ul>
                  <li>Starte RetroArch auf deinem Apple TV</li>
                  <li>Gehe zu Settings → Network</li>
                  <li>Aktiviere "Network Commands" und "Web User Interface"</li>
                  <li>Notiere die angezeigte IP-Adresse</li>
                </ul>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="test-btn"
                  onClick={handleTest}
                  disabled={saving}
                >
                  🔍 Verbindung testen
                </button>

                <button
                  type="submit"
                  className="save-btn"
                  disabled={saving}
                >
                  {saving ? '💾 Speichert...' : '💾 Speichern'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
