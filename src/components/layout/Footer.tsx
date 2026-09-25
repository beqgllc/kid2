import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__brand">
        <img src="/images/brand/attikid-wordmark.svg" alt="ATTIKID" />
        <span>REAL MUSIC. REAL SHIT.</span>
      </div>
      <div className="site-footer__links">
        <Link to="/">Home</Link>
        <Link to="/music/albums">Music</Link>
        <Link to="/videos">Videos</Link>
        <Link to="/about">About</Link>
        <Link to="/store">Store</Link>
      </div>
      <small>© {new Date().getFullYear()} ATTIKID. ALL RIGHTS RESERVED.</small>
    </footer>
  );
}
