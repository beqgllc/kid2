import { Link, NavLink } from 'react-router-dom';
import { useUIStore } from '../../stores/uiStore';
import './nav.css';

export function Header() {
  const { mobileMenuOpen, setMobileMenuOpen } = useUIStore();

  return (
    <header className={`site-header${mobileMenuOpen ? ' nav-open' : ''}`}>
      <Link className="brand" to="/" onClick={() => setMobileMenuOpen(false)} aria-label="ATTIKID home">
        <span className="brand-wordmark">Attikid</span>
      </Link>
      <button className="menu-button" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Menu">☰</button>
      <nav>
        <NavLink end to="/" onClick={() => setMobileMenuOpen(false)}>Home</NavLink>
        <NavLink to="/music" onClick={() => setMobileMenuOpen(false)}>Music</NavLink>
        <NavLink to="/videos" onClick={() => setMobileMenuOpen(false)}>Videos</NavLink>
        <NavLink to="/about" onClick={() => setMobileMenuOpen(false)}>About</NavLink>
        <NavLink to="/journal" onClick={() => setMobileMenuOpen(false)}>Journal</NavLink>
        <NavLink to="/store" onClick={() => setMobileMenuOpen(false)}>Store</NavLink>
      </nav>
    </header>
  );
}
