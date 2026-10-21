import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="corner-footer">
      <Link className="corner-footer__merch" to="/store">Merch</Link>
      <div className="corner-footer__legal">
        <small>© {new Date().getFullYear()} Attikid. All rights reserved</small>
        <small>Same kid. Different demons.</small>
      </div>
      <Link className="corner-footer__contact" to="/fan-mail">Contact</Link>
    </footer>
  );
}
