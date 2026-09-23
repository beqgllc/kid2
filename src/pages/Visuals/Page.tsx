import { Link } from 'react-router-dom';
import { usePageMeta } from '../../lib/seo';

const visuals = [
  { category: 'FEATURED FILM', title: 'Funeral / The visual world', image: '/images/hero/attikid-hero.webp', className: 'visuals-feature' },
  { category: 'PHOTOGRAPHY', title: 'Artist press portrait', image: '/images/artist/artist-press-photo-1.webp', className: '' },
  { category: 'ARTWORK', title: 'The ATTIKID archive', image: '/images/hero/hero-music.webp', className: '' },
];

export function Visuals() {
  usePageMeta({
    title: 'Videos — ATTIKID',
    description: 'Watch ATTIKID visualizers, lyric videos, photography, and visual work.',
    canonical: 'https://attikid.vercel.app/visuals',
    type: 'website',
    keywords: ['ATTIKID videos', 'visualizers', 'lyric videos', 'artist photography'],
    image: '/images/hero/attikid-hero.webp',
  });

  return (
    <div className="visuals-page portfolio-visuals-page">
      <header className="catalog-hero">
        <div>
          <span className="portfolio-label">VIDEOS / VISUALS</span>
          <h1>The archive in motion.</h1>
          <p>Visualizers, lyric films, photography, and the images that live with the records.</p>
          <div className="music-page-links">
            <Link className="active" to="/videos">Videos</Link>
            <Link to="/visuals/lyric-videos">Lyric videos</Link>
          </div>
        </div>
      </header>
      <div className="visuals-grid">
        {visuals.map((visual) => (
          <article className={`visual-tile ${visual.className}`} key={visual.title}>
            <img src={visual.image} alt={visual.title} />
            <div className="visual-tile__caption">
              <span>{visual.category}</span>
              <h2>{visual.title}</h2>
              <span className="visual-link">View →</span>
            </div>
          </article>
        ))}
        <article className="visual-tile">
          <div className="visual-tile__caption">
            <span>LYRIC VIDEOS</span>
            <h2>Words in motion.</h2>
            <Link className="button" to="/visuals/lyric-videos">View →</Link>
          </div>
        </article>
      </div>
    </div>
  );
}
