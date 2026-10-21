import { usePageMeta } from '../../lib/seo';

export function Home() {
  usePageMeta({
    title: 'ATTIKID | Music, Lyrics & Story',
    description: 'ATTIKID. Same kid, different demons. You are not alone.',
    canonical: 'https://attikid.vercel.app/',
    type: 'website',
    keywords: ['ATTIKID', 'music', 'albums', 'songs', 'artist'],
    image: '/images/hero/attikid-hero.webp',
  });

  return (
    <div className="home-splash">
      <section className="home-splash__message" aria-label="ATTIKID message">
        <h1><span>SAME</span> <em>K!D</em><br /><span>DIFFERENT</span> <em>DEMONS</em></h1>
        <p>You are not alone</p>
      </section>
    </div>
  );
}
