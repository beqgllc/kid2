import { Link } from 'react-router-dom';
import { buildWebSiteJsonLd, usePageMeta } from '../../lib/seo';
export function NotFound(){
  usePageMeta({
    title: '404 — ATTIKID',
    description: 'The requested ATTIKID page could not be found.',
    canonical: 'attikid.vercel.app/404',
    type: 'website',
    keywords: ['ATTIKID', '404', 'page not found'],
    image: '/images/hero/hero-home.webp',
    jsonLd: buildWebSiteJsonLd()
  });

  return <section className="center-page"><span className="eyebrow">404</span><h1>Signal lost.</h1><p>The page you're looking for doesn't exist.</p><div className="button-row"><Link className="button" to="/">Return home</Link><Link className="button secondary" to="/music">Music</Link></div></section>;
}
