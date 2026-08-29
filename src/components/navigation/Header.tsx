import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useUIStore } from '../../stores/uiStore';
import { AdminAuthModal } from '../../pages/Admin/Login';
import './nav.css';

export function Header(){
  const {mobileMenuOpen,setMobileMenuOpen}=useUIStore();
  const [adminModalOpen,setAdminModalOpen]=useState(false);
  const navigate = useNavigate();

  return <>
    <header className="site-header">
      <Link className="brand" to="/"><img src="/images/brand/kid-monogram-white.svg" alt=""/><span>ATTIKID</span></Link>
      <button className="menu-button" onClick={()=>setMobileMenuOpen(!mobileMenuOpen)} aria-label="Menu">☰</button>
      <nav className={mobileMenuOpen?'nav-open':''}>
        <NavLink to="/music" onClick={()=>setMobileMenuOpen(false)}>Music</NavLink>
        <NavLink to="/lyrics" onClick={()=>setMobileMenuOpen(false)}>Lyrics</NavLink>
        <NavLink to="/about" onClick={()=>setMobileMenuOpen(false)}>About</NavLink>
        <NavLink to="/fan-mail" onClick={()=>setMobileMenuOpen(false)}>Fan Mail</NavLink>
        <button type="button" className="admin-link" onClick={() => { setMobileMenuOpen(false); setAdminModalOpen(true); }}>
          Admin
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
