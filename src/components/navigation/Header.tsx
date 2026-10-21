import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { studioTools } from '../../pages/Studio/tools';
import './nav.css';

export function Header() {
  const [musicOpen, setMusicOpen] = useState(false);
  const [studioOpen, setStudioOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const studioActive = location.pathname.startsWith('/studio');

  const openStudio = () => {
    if (!studioActive) navigate('/studio');
    setStudioOpen((open) => !open);
    setMusicOpen(false);
  };

  return (
    <header className="corner-header">
      <div className={`corner-menu corner-menu--music${musicOpen ? ' is-open' : ''}`}>
        <button type="button" className="corner-nav-link" onClick={() => setMusicOpen((open) => !open)} aria-expanded={musicOpen} aria-controls="music-navigation">
          Music <span aria-hidden="true">{musicOpen ? '−' : '+'}</span>
        </button>
        <nav id="music-navigation" className="corner-menu-panel" aria-label="Music navigation" hidden={!musicOpen}>
          <Link to="/music/albums" onClick={() => setMusicOpen(false)}>Albums / Releases</Link>
          <Link to="/music/songs" onClick={() => setMusicOpen(false)}>All Songs</Link>
          <Link to="/music/albums#album-archive" onClick={() => setMusicOpen(false)}>Songs by Album</Link>
          <span className="corner-menu-panel__rule" />
          <Link to="/videos" onClick={() => setMusicOpen(false)}>Videos</Link>
          <Link to="/lyrics" onClick={() => setMusicOpen(false)}>Lyrics</Link>
          <Link to="/about" onClick={() => setMusicOpen(false)}>About ATTIKID</Link>
        </nav>
      </div>

      <Link className="corner-brand" to="/" aria-label="ATTIKID home">
        <img src="/images/brand/attikid-wordmark.svg" alt="ATTIKID" />
      </Link>

      <button type="button" className={`corner-nav-link corner-nav-link--studio${studioActive ? ' is-active' : ''}`} onClick={openStudio} aria-expanded={studioOpen} aria-controls="studio-tools-drawer">
        Studio <span aria-hidden="true">{studioOpen ? '−' : '+'}</span>
      </button>

      <aside id="studio-tools-drawer" className={`studio-tools-drawer${studioOpen ? ' is-open' : ''}`} aria-label="Studio tools" hidden={!studioOpen}>
        <div className="studio-tools-drawer__head"><span>ATTIKID / STUDIO</span><button type="button" onClick={() => setStudioOpen(false)} aria-label="Close Studio menu">×</button></div>
        <Link className="studio-tools-drawer__home" to="/studio" onClick={() => setStudioOpen(false)}>Studio home <span>↗</span></Link>
        <nav>{studioTools.map((tool, index) => <Link key={tool.slug} to={`/studio/tools/${tool.slug}`} onClick={() => setStudioOpen(false)}><small>0{index + 1}</small>{tool.name}<span>↗</span></Link>)}</nav>
      </aside>
    </header>
  );
}
