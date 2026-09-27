import { Link, NavLink } from 'react-router-dom';
import { useUIStore } from '../../stores/uiStore';
import './nav.css';

export function Header() {
  const { mobileMenuOpen, setMobileMenuOpen } = useUIStore();
  const closeNavigation = () => setMobileMenuOpen(false);

  return (
    <header className={`site-header${mobileMenuOpen ? ' nav-open' : ''}`}>
      <Link className="brand" to="/" onClick={closeNavigation} aria-label="ATTIKID home">
        <img className="brand-logo" src="/images/brand/logo.svg" alt="ATTIKID" />
      </Link>

      <button className="menu-button" type="button" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Menu" aria-expanded={mobileMenuOpen}>☰</button>

      <nav aria-label="Primary navigation">
        <NavLink end to="/" onClick={closeNavigation}>HOME</NavLink>
        <NavLink to="/music/albums" onClick={closeNavigation}>MUSIC</NavLink>
        <NavLink to="/videos" onClick={closeNavigation}>VIDEOS</NavLink>
        <NavLink to="/about" onClick={closeNavigation}>ABOUT</NavLink>
        <NavLink to="/store" onClick={closeNavigation}>MERCH</NavLink>
      </nav>

      <div className="site-header__tools" aria-label="ATTIKID social links">
        <a href="https://x.com/Attikid_" target="_blank" rel="noreferrer" aria-label="X">𝕏</a>
        <a href="https://open.spotify.com/artist/7gZqcmdAs7JRUsHmYtRK0M" target="_blank" rel="noreferrer" aria-label="Spotify">●</a>
        <a href="https://soundcloud.com/attikid" target="_blank" rel="noreferrer" aria-label="SoundCloud">☁</a>
        <a href="https://tiktok.com/iamattikid" target="_blank" rel="noreferrer" aria-label="TikTok">♪</a>
      </div>
    </header>
  );
}
