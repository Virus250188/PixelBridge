/**
 * Header Component
 */

import { Link } from 'react-router-dom';
import ConnectionStatus from '../retroarch/ConnectionStatus';

export default function Header() {
  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            <img src="/logo-banner-transparent.png" alt="PixelBridge" className="logo-image" />
          </Link>

          <ConnectionStatus />

          <nav className="nav">
            <Link to="/" className="nav-link">Library</Link>
            <Link to="/upload" className="nav-link">Upload</Link>
            <Link to="/favorites" className="nav-link">Favorites</Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
