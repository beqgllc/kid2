import { Link } from 'react-router-dom';
import { usePageMeta } from '../../lib/seo';

const posts = [
  { title: 'Behind the music', meta: 'Notes / Process', text: 'A running record of songs, ideas, late nights, and the work behind each release.' },
  { title: 'The places that made the records', meta: 'Story / Visuals', text: 'Snapshots from the rooms, streets, and moments that became part of the catalog.' },
  { title: 'New release notes', meta: 'Updates', text: 'Announcements, release notes, and whatever is worth saying between songs.' },
];

export function Journal() {
  usePageMeta({ title: 'Journal — ATTIKID', description: 'Notes, stories, process, and updates from ATTIKID.', canonical: 'https://attikid.vercel.app/journal', type: 'website' });
  return (
    <div className="page journal-page">
      <header className="page-hero">
        <span className="eyebrow">JOURNAL / NOTES</span>
        <h1>Things I&apos;m not putting in the songs.</h1>
        <p>Thoughts, stories, process, and the context around the music.</p>
      </header>
      <section className="content-section journal-list">
        {posts.map((post) => (
          <article className="journal-row" key={post.title}>
            <div><span>{post.meta}</span><h2>{post.title}</h2></div>
            <p>{post.text}</p>
            <Link to="/fan-mail">Read →</Link>
          </article>
        ))}
      </section>
    </div>
  );
}
