/**
 * ROM Card Component
 */

export default function RomCard({ rom, isSelected, onSelect, onInfo }) {
  const coverUrl = rom.cover_image_path
    ? `http://localhost:3000/covers/${rom.cover_image_path.split('/').pop()}`
    : '/placeholder.png';

  const handleCheckboxChange = (e) => {
    e.stopPropagation();
    onSelect(rom.id);
  };

  const handleInfoClick = (e) => {
    e.stopPropagation();
    onInfo(rom);
  };

  return (
    <div className={`rom-card ${isSelected ? 'selected' : ''}`}>
      <div className="rom-card-header">
        <input
          type="checkbox"
          className="rom-checkbox"
          checked={isSelected}
          onChange={handleCheckboxChange}
          onClick={(e) => e.stopPropagation()}
        />
        <button className="rom-info-btn" onClick={handleInfoClick} title="ROM Details">
          <img src="/info-icon.png" alt="Info" className="info-icon" />
        </button>
      </div>

      <div className="rom-cover">
        <img src={coverUrl} alt={rom.title} onError={(e) => e.target.src = '/placeholder.png'} />
        {rom.has_saves && (
          <div className="save-indicator" title="Savegame vorhanden">
            <img src="/save-icon.png" alt="Save" className="save-icon" />
          </div>
        )}
      </div>
      <div className="rom-info">
        <h3 className="rom-title">{rom.title}</h3>
        <span className="rom-platform">{rom.platform_name}</span>
      </div>
    </div>
  );
}
