import { Link, useSearchParams } from 'react-router-dom';
import { buildWebSiteJsonLd, usePageMeta } from '../../lib/seo';

export function NotFound() {
  const [params] = useSearchParams();
  const isStore = params.get('from') === 'store';

  usePageMeta({
    title: isStore ? 'Store Coming Soon — ATTIKID' : '404 — ATTIKID',
    description: isStore
      ? 'The ATTIKID store is currently under construction and coming soon.'
      : 'The requested ATTIKID page could not be found.',
    canonical: 'https://attikid.vercel.app/404',
    type: 'website',
    keywords: ['ATTIKID', '404', 'page not found', 'store', 'coming soon'],
    image: '/images/hero/attikid-hero.webp',
    jsonLd: buildWebSiteJsonLd(),
  });

  return (
    <section className="center-page site-404">
      <span className="eyebrow">{isStore ? 'STORE / COMING SOON' : '404'}</span>
      <h1>{isStore ? 'The store is under construction.' : 'Signal lost.'}</h1>
      <p>{isStore ? 'The ATTIKID store is being built now. Come back soon.' : 'The page you\'re looking for doesn\'t exist.'}</p>
      <div className="button-row">
        <Link className="button" to="/">Return home</Link>
        <Link className="button secondary" to="/music/albums">Albums</Link>
      </div>
    </section>
  );
}
