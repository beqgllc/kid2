import { Link } from 'react-router-dom';
import { RichContent } from '../../components/content/RichContent';
import { aboutContent } from '../../content/about';

export function About() {
  return <div className="page">
    <header className="page-hero">
      <span className="eyebrow">ABOUT</span>
      <h1>ATTIKID</h1>
    </header>
    <article className="prose">
      <RichContent blocks={aboutContent} />
      <Link className="button" to="/music">Listen to the music</Link>
    </article>
  </div>;
}
