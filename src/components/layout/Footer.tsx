import { Link } from 'react-router-dom';

export function Footer(){return <footer className="site-footer"><div><strong>ATTIKID</strong><p>Music for the things we don't say.</p></div><div className="site-footer__links"><Link to="/music">Music</Link><Link to="/about">About</Link><Link to="/fan-mail">Contact</Link></div><small>© {new Date().getFullYear()} ATTIKID MUSIC</small></footer>}
