import { Link } from 'react-router-dom';
import { RichContent } from '../../components/content/RichContent';
import { aboutContent } from '../../content/about';

export function About() {
  return <div className="page">
    <header className="page-hero page-hero-with-image">
      <span className="eyebrow">ABOUT</span>
      <h1>ATTIKID</h1>
      <p>The person behind the music.</p>
      <img src="/images/hero/hero-about.webp" alt="Artist portrait in a wood-paneled room" />
    </header>
    <article className="prose">
      <img className="artist-portrait" src="/images/artist/kid-portrait-primary.webp" alt="Portrait of ATTIKID" />
      <RichContent blocks={aboutContent} />
      <Link className="button" to="/music">Listen to the music</Link>
    </article>
  </div>;
}
