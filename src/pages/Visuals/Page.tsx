import { usePageMeta } from '../../lib/seo';

const visuals = [
  { category: 'FEATURED FILM', title: 'The room remembers', image: '/images/hero/hero-about.webp', className: 'visuals-feature' },
  { category: 'PHOTOGRAPHY', title: 'Artist press portrait', image: '/images/artist/artist-press-photo-1.webp', className: '' },
  { category: 'ARTWORK', title: 'The ATTIKID archive', image: '/images/hero/hero-music.webp', className: '' },
  { category: 'LYRIC VIDEOS', title: 'For the people who survived quietly', image: '/images/hero-image.png', className: '' },
];

export function Visuals() {
  usePageMeta({
    title: 'Visuals — ATTIKID',
    description: 'Enter the ATTIKID visual archive: films, photography, artwork, and lyric videos.',
    canonical: 'https://attikid.vercel.app/visuals',
    type: 'website',
    keywords: ['ATTIKID visuals', 'music videos', 'artist photography', 'artwork'],
    image: '/images/hero-image.png',
  });

  return <div className="visuals-page">
    <header className="visuals-page__header">
      <span className="eyebrow">03 / VISUALS</span>
      <h1>The archive in motion.</h1>
      <p>Photographs, artwork, and lyric films from the rooms where the music takes shape.</p>
    </header>
    <div className="visuals-grid">
      {visuals.map((visual) => <article className={`visual-tile ${visual.className}`} key={visual.title}>
        <img src={visual.image} alt={visual.title} />
        <div className="visual-tile__caption"><span>{visual.category}</span><h2>{visual.title}</h2><button type="button" aria-label={`Open ${visual.title}`}>View →</button></div>
      </article>)}
    </div>
  </div>;
}
