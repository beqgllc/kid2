import { Link, NavLink, useLocation } from 'react-router-dom';
import { useUIStore } from '../../stores/uiStore';
import './nav.css';

const musicLinks = [
  { label: 'A-Z', to: '/music/a-z' },
  { label: 'Albums', to: '/music/albums' },
  { label: 'Singles', to: '/music/singles' },
];

export function Header(){
  const { mobileMenuOpen, setMobileMenuOpen } = useUIStore();
  const location = useLocation();
  const musicOpen = location.pathname === '/music' || location.pathname.startsWith('/music/');

  return <header className={`site-header${mobileMenuOpen ? ' nav-open' : ''}`}>
    <Link className="brand" to="/" onClick={() => setMobileMenuOpen(false)}>
      <img src="/images/brand/kid-monogram-white.svg" alt="ATTIKID home"/>
      <span>ATTIKID</span>
    </Link>
    <button className="menu-button" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Menu">☰</button>

    <nav>
      <NavLink end to="/" onClick={() => setMobileMenuOpen(false)}>Home</NavLink>

      <div className="music-nav-item">
        <Link className={musicOpen ? 'active' : ''} to="/music" onClick={() => setMobileMenuOpen(false)}>Music</Link>
        {musicOpen && (
          <div className="music-submenu" aria-label="Music sections">
            {musicLinks.map((item) => (
              <NavLink key={item.to} to={item.to} onClick={() => setMobileMenuOpen(false)}>
                {item.label}
              </NavLink>
            ))}
          </div>
        )}
      </div>

      <NavLink to="/visuals" onClick={() => setMobileMenuOpen(false)}>Visuals</NavLink>
      <NavLink to="/about" onClick={() => setMobileMenuOpen(false)}>About</NavLink>
      <NavLink to="/admin/login" onClick={() => setMobileMenuOpen(false)}>Login</NavLink>
    </nav>

    <div className="site-header__tools">
      <button type="button" aria-label="Audio visualizer" className="signal-bars"><i/><i/><i/><i/></button>
      <button type="button" aria-label="Search" className="header-icon">⌕</button>
      <button type="button" aria-label="Fan account" className="header-icon">◯</button>
    </div>
  </header>;
}
