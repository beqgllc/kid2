import { Link, NavLink } from 'react-router-dom';
import { useUIStore } from '../../stores/uiStore';
import './nav.css';

export function Header(){const {mobileMenuOpen,setMobileMenuOpen}=useUIStore();return <header className="site-header"><Link className="brand" to="/">ATTIKID</Link><button className="menu-button" onClick={()=>setMobileMenuOpen(!mobileMenuOpen)} aria-label="Menu">☰</button><nav className={mobileMenuOpen?'nav-open':''}><NavLink to="/music" onClick={()=>setMobileMenuOpen(false)}>Music</NavLink><NavLink to="/lyrics" onClick={()=>setMobileMenuOpen(false)}>Lyrics</NavLink><NavLink to="/about" onClick={()=>setMobileMenuOpen(false)}>About</NavLink><NavLink to="/fan-mail" onClick={()=>setMobileMenuOpen(false)}>Fan Mail</NavLink></nav></header>}
