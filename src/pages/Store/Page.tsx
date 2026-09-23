import { usePageMeta } from '../../lib/seo';

const items = [
  ['T-SHIRT', 'Signal tee'],
  ['HOODIE', 'Heavyweight hoodie'],
  ['HAT', 'Embroidered cap'],
  ['VINYL', 'Selected release pressings'],
];

export function Store() {
  usePageMeta({ title: 'Store — ATTIKID', description: 'ATTIKID music and merchandise.', canonical: 'https://attikid.vercel.app/store', type: 'website' });
  return (
    <div className="page store-page">
      <header className="page-hero">
        <span className="eyebrow">STORE / GOODS</span>
        <h1>Carry the signal.</h1>
        <p>Physical pieces of the world around the music. Store infrastructure can plug into this layout when the catalog is ready.</p>
      </header>
      <section className="content-section">
        <div className="store-grid">
          {items.map(([type, name]) => (
            <article className="store-card" key={type}>
              <div className="store-card__image"><span>{type}</span></div>
              <div><span className="portfolio-label">{type}</span><h2>{name}</h2><p>Coming soon.</p></div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
