import { Link, NavLink } from 'react-router-dom';
import { useState } from 'react';
import { useUIStore } from '../../stores/uiStore';
import './nav.css';

export function Header() {
  const { mobileMenuOpen, setMobileMenuOpen } = useUIStore();
  const [musicOpen, setMusicOpen] = useState(false);

  const closeNavigation = () => {
    setMusicOpen(false);
    setMobileMenuOpen(false);
  };

  return (
    <header className={`site-header${mobileMenuOpen ? ' nav-open' : ''}`}>
      <Link className="brand" to="/" onClick={closeNavigation} aria-label="ATTIKID home">
        <img className="brand-logo" src="/images/brand/logo.svg" alt="ATTIKID" />
      </Link>

      <button
        className="menu-button"
        type="button"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Menu"
        aria-expanded={mobileMenuOpen}
      >
        ☰
      </button>

      <nav aria-label="Primary navigation">
        <NavLink end to="/" onClick={closeNavigation}>Home</NavLink>

        <div className={`music-menu${musicOpen ? ' is-open' : ''}`}>
          <button
            type="button"
            className="music-menu__trigger"
            onClick={() => setMusicOpen((open) => !open)}
            aria-expanded={musicOpen}
            aria-haspopup="menu"
          >
            Music <span aria-hidden="true">{musicOpen ? '−' : '+'}</span>
          </button>
          <div className="music-menu__panel" role="menu">
            <NavLink to="/music/a-z" role="menuitem" onClick={closeNavigation}>A–Z</NavLink>
            <NavLink to="/music/albums" role="menuitem" onClick={closeNavigation}>Albums</NavLink>
          </div>
        </div>

        <NavLink to="/videos" onClick={closeNavigation}>Videos</NavLink>
        <NavLink to="/about" onClick={closeNavigation}>About</NavLink>
        <NavLink to="/store" onClick={closeNavigation}>Store</NavLink>
      </nav>
    </header>
  );
}
