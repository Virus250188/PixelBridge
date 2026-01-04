/**
 * ROM Details Modal Component
 */

import { useState } from 'react';
import { romApi } from '../../api';
import toast from 'react-hot-toast';

export default function RomDetails({ rom, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false);
  const [isFavorite, setIsFavorite] = useState(rom.favorite === 1 || rom.favorite === true);
  const [toggling, setToggling] = useState(false);

  // Use current hostname for cover images (works for localhost and IP access)
  const getApiHost = () => {
    if (import.meta.env.VITE_API_BASE_URL) {
      return import.meta.env.VITE_API_BASE_URL.replace('/api', '');
    }
    if (import.meta.env.DEV) {
      return `http://${window.location.hostname}:3000`;
    }
    return ''; // Production uses relative paths
  };

  const coverUrl = rom.cover_image_path
    ? `${getApiHost()}/covers/${rom.cover_image_path.split('/').pop()}`
    : '/placeholder.png';

  const handleToggleFavorite = async () => {
    try {
      setToggling(true);
      await romApi.toggleFavorite(rom.id);
      setIsFavorite(!isFavorite);
      toast.success(isFavorite ? '💔 Favorit entfernt' : '💖 Zu Favoriten hinzugefügt');
    } catch (error) {
      toast.error(`❌ Fehler: ${error.message}`);
    } finally {
      setToggling(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Möchtest du "${rom.title}" wirklich löschen? Dies entfernt die ROM-Datei und alle zugehörigen Daten.`)) {
      return;
    }

    try {
      setDeleting(true);
      await romApi.deleteRom(rom.id);
      toast.success(`✅ ${rom.title} wurde erfolgreich gelöscht`);
      onClose();
      if (onDeleted) onDeleted();
    } catch (error) {
      toast.error(`❌ Fehler beim Löschen: ${error.message}`);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <div className="modal-header">
          <h2 className="modal-title">{rom.title}</h2>
          <span className="modal-platform">{rom.platform_name}</span>
        </div>

        <div className="modal-body">
          <div className="modal-cover">
            <img src={coverUrl} alt={rom.title} onError={(e) => e.target.src = '/placeholder.png'} />
          </div>

          <div className="modal-info">
            {rom.description && (
              <div className="info-section">
                <h3>Description</h3>
                <p>{rom.description}</p>
              </div>
            )}

            <div className="info-grid">
              {rom.developer && (
                <div className="info-item">
                  <span className="info-label">Developer</span>
                  <span className="info-value">{rom.developer}</span>
                </div>
              )}

              {rom.publisher && (
                <div className="info-item">
                  <span className="info-label">Publisher</span>
                  <span className="info-value">{rom.publisher}</span>
                </div>
              )}

              {rom.genre && (
                <div className="info-item">
                  <span className="info-label">Genre</span>
                  <span className="info-value">{rom.genre}</span>
                </div>
              )}

              {rom.release_date && (
                <div className="info-item">
                  <span className="info-label">Release Date</span>
                  <span className="info-value">{rom.release_date}</span>
                </div>
              )}

              {rom.rating && (
                <div className="info-item">
                  <span className="info-label">Rating</span>
                  <span className="info-value">{rom.rating}/100</span>
                </div>
              )}

              {rom.players && (
                <div className="info-item">
                  <span className="info-label">Players</span>
                  <span className="info-value">{rom.players}</span>
                </div>
              )}
            </div>

            <div className="info-section">
              <h3>File Info</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Filename</span>
                  <span className="info-value">{rom.file_name}</span>
                </div>
                {rom.file_size && (
                  <div className="info-item">
                    <span className="info-label">Size</span>
                    <span className="info-value">{(rom.file_size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="modal-actions">
              <button
                className="favorite-btn"
                onClick={handleToggleFavorite}
                disabled={toggling}
                title={isFavorite ? 'Von Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
              >
                <img
                  src={isFavorite ? '/heart-filled.png' : '/heart-empty.png'}
                  alt={isFavorite ? 'Favorit' : 'Nicht favorisiert'}
                  className="favorite-icon"
                />
              </button>

              <button
                className="delete-btn"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? '🗑️ Wird gelöscht...' : '🗑️ ROM Löschen'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
