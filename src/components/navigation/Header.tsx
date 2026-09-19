import { Link, NavLink } from 'react-router-dom';
import { useUIStore } from '../../stores/uiStore';
import './nav.css';

export function Header(){
  const {mobileMenuOpen,setMobileMenuOpen}=useUIStore();

  return <header className={`site-header${mobileMenuOpen ? ' nav-open' : ''}`}>
    <Link className="brand" to="/" onClick={()=>setMobileMenuOpen(false)}><img src="/images/brand/kid-monogram-white.svg" alt="ATTIKID home"/><span>ATTIKID</span></Link>
    <button className="menu-button" onClick={()=>setMobileMenuOpen(!mobileMenuOpen)} aria-label="Menu">☰</button>
    <nav>
      <NavLink end to="/" onClick={()=>setMobileMenuOpen(false)}>Home</NavLink>
      <NavLink to="/music" onClick={()=>setMobileMenuOpen(false)}>Music</NavLink>
      <NavLink to="/visuals" onClick={()=>setMobileMenuOpen(false)}>Visuals</NavLink>
      <NavLink to="/about" onClick={()=>setMobileMenuOpen(false)}>About</NavLink>
    </nav>
    <div className="site-header__tools">
      <button type="button" aria-label="Audio visualizer" className="signal-bars"><i/><i/><i/><i/></button>
      <button type="button" aria-label="Search" className="header-icon">⌕</button>
      <button type="button" aria-label="Fan account" className="header-icon">◯</button>
    </div>
  </header>;
}
