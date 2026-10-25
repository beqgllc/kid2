import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="corner-footer">
      <Link className="corner-footer__merch" to="/store">Merch</Link>
      <div className="corner-footer__legal">
        <small>© {new Date().getFullYear()} Attikid. All rights reserved.</small>
        <small className="corner-footer__social">
          <Link to="/about">About ATTIKID</Link>
          <a href="https://www.tiktok.com/@iamattikid" target="_blank" rel="noopener noreferrer">TikTok profile</a>
          <a
            href="https://twitter.com/intent/tweet?url=https%3A%2F%2Fattikid.com%2F&text=Explore%20ATTIKID%20music%2C%20lyrics%20and%20artist%20story."
            target="_blank"
            rel="noopener noreferrer"
          >Share on X</a>
          <a
            href="https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fattikid.com%2F"
            target="_blank"
            rel="noopener noreferrer"
          >Share on Facebook</a>
        </small>
      </div>
      <Link className="corner-footer__contact" to="/fan-mail">Contact</Link>
    </footer>
  );
}
