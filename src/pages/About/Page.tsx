import { Link } from 'react-router-dom';
import { RichContent } from '../../components/content/RichContent';
import { aboutContent } from '../../content/about';
import { buildWebSiteJsonLd, usePageMeta } from '../../lib/seo';

export function About() {
  usePageMeta({
    title: 'About ATTIKID — Artist Story',
    description: 'Meet ATTIKID, the artist behind the music, lyrics, and story of the catalog.',
    canonical: 'attikid.vercel.app/about',
    type: 'profile',
    keywords: ['ATTIKID', 'artist story', 'bio', 'about'],
    image: '/images/hero/hero-about.webp',
    jsonLd: buildWebSiteJsonLd()
  });

  return <div className="page">
    <header className="page-hero page-hero-with-image">
      <span className="eyebrow">ABOUT</span>
      <h1>ATTIKID</h1>
      <p>The person behind the music.</p>
      <img src="/images/hero/hero-about.webp" 
      alt="Artist portrait in a wood-paneled room"
      width={800}
      height={800}
       />
    </header>
    <article className="prose">
      <img className="artist-portrait" 
      src="/images/artist/kid-portrait-primary.webp" 
      alt="Portrait of ATTIKID"
      width={800}
      height={800} />
      <RichContent blocks={aboutContent} />
      <Link className="button" to="/music">Listen to the music</Link>
    </article>
  </div>;
}
