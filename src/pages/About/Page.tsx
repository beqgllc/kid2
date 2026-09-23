import { Link } from 'react-router-dom';
import { PortfolioPageHeader } from '../../components/portfolio/PortfolioPageHeader';
import { RichContent } from '../../components/content/RichContent';
import { aboutContent } from '../../content/about';
import { buildWebSiteJsonLd, usePageMeta } from '../../lib/seo';

export function About() {
  usePageMeta({
    title: 'About ATTIKID — Artist Story',
    description: 'Meet ATTIKID, the artist behind the music, lyrics, and story of the catalog.',
    canonical: 'https://attikid.vercel.app/about',
    type: 'profile',
    keywords: ['ATTIKID', 'artist story', 'bio', 'about'],
    image: '/images/artist/kid-portrait-primary.webp',
    jsonLd: buildWebSiteJsonLd(),
  });

  return (
    <div className="page about-portfolio-page">
      <PortfolioPageHeader
        eyebrow="ABOUT / THE ARTIST"
        title={<>Same kid.<br />Different demons.</>}
        description="The person behind the music, the records, and the stories between them."
        className="about-hero"
      />

      <section className="about-split">
        <div className="about-image">
          <img src="/images/artist/kid-portrait-primary.webp" alt="Portrait of ATTIKID" />
        </div>
        <div className="about-story">
          <span className="portfolio-label">THE STORY</span>
          <h2>Music for the things we don&apos;t say.</h2>
          <RichContent blocks={aboutContent} />
          <Link className="button" to="/music/albums">Listen to the music →</Link>
        </div>
      </section>

      <section className="about-quote">
        <span>“MUSIC IS JUST ANOTHER WAY FOR ME TO BE HONEST.”</span>
        <small>— ATTIKID</small>
      </section>
    </div>
  );
}
