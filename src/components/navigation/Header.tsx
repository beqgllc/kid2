import { Link, NavLink, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useUIStore } from '../../stores/uiStore';
import { AdminAuthModal } from '../../pages/Admin/Login';
import './nav.css';

export function Header(){
  const {mobileMenuOpen,setMobileMenuOpen}=useUIStore();
  const [adminModalOpen,setAdminModalOpen]=useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname === '/') {
    return null;
  }

  return <>
    <header className="site-header">
      <Link className="brand" to="/"><img src="/images/brand/kid-monogram-white.svg" alt="ATTIKID home"/><span>ATTIKID</span></Link>
      <button className="menu-button" onClick={()=>setMobileMenuOpen(!mobileMenuOpen)} aria-label="Menu">☰</button>
      <nav className={mobileMenuOpen?'nav-open':''}>
        <NavLink to="/" onClick={()=>setMobileMenuOpen(false)}>Home</NavLink>
        <NavLink to="/supply" onClick={()=>setMobileMenuOpen(false)}>Supply</NavLink>

        <div className="music-menu">
          <NavLink to="/music" className="music-menu-trigger" onClick={()=>setMobileMenuOpen(false)}>Music</NavLink>
          <div className="music-menu-panel">
            <span className="music-menu-cascade">↓</span>
            <NavLink to="/music/albums" onClick={()=>setMobileMenuOpen(false)}>Albums</NavLink>
            <span className="music-menu-cascade">↓</span>
            <NavLink to="/music/lyrics" onClick={()=>setMobileMenuOpen(false)}>Lyrics</NavLink>
            <span className="music-menu-cascade">↓</span>
            <NavLink to="/music/videos" onClick={()=>setMobileMenuOpen(false)}>Videos</NavLink>
          </div>
        </div>

        <NavLink to="/story" onClick={()=>setMobileMenuOpen(false)}>Story</NavLink>
        <button type="button" className="admin-link" onClick={() => { setMobileMenuOpen(false); setAdminModalOpen(true); }}>
          Auth
        </button>
      </nav>
    </header>
    <AdminAuthModal
      open={adminModalOpen}
      onClose={() => setAdminModalOpen(false)}
      onSuccess={() => {
        setMobileMenuOpen(false);
        navigate('/admin');
      }}
    />
  </>;
}
