import { Link } from 'react-router-dom';
import { usePageMeta } from '../../lib/seo';

export function Home() {
  usePageMeta({
    title: 'ATTIKID Official Site | Music, Lyrics & Artist Story',
    description:
      'Discover ATTIKID, an artist and songwriter creating alternative rap, emo rap, original music, lyric archives, music videos, and stories shaped by lived experience.',
    canonical: '/',
    type: 'website',
    keywords: [
      'ATTIKID',
      'ATTIKID music',
      'alternative rap',
      'emo rap',
      'melodic rap',
      'lyrics',
      'music videos',
      'artist story',
    ],
    image: '/images/artist/artist-press-photo-1.webp',
  });

  return (
    <>
      <div className="home-splash">
        <section className="home-splash__message" aria-label="ATTIKID message">
          <h1><span>SAME</span> <em>K!D</em><br /><span>DIFFERENT</span> <em>DEMONS</em></h1>
          <p>You are not alone</p>
        </section>
      </div>

      <section className="home-seo-content" aria-labelledby="home-seo-title">
        <div className="home-seo-content__inner">
          <span className="portfolio-label">ATTIKID / THE ARTIST ARCHIVE</span>
          <h2 id="home-seo-title">Original music, lyrics, and the stories behind them.</h2>
          <p>
            ATTIKID is the artist project of songwriter Travis Gordon, built around alternative rap,
            emo rap, melodic rap, introspective hip-hop, and writing shaped by lived experience.
            The music documents memory, identity, love, loss, regret, resilience, and the difficult
            emotions that rarely fit into ordinary conversation.
          </p>
          <p>
            This catalog is more than a list of releases. Album pages connect records with their
            artwork, tracklists, release details, and stories where those details are available.
            Individual song pages bring each track into focus, with album associations, artwork,
            release information, and lyrics when they have been published. The lyric archive gives
            listeners another way to revisit the words and follow the writing across the catalog.
          </p>
          <p>
            Browse the official ATTIKID website to listen to albums and songs, explore music videos,
            read the artist story, and find new additions to the archive. Available details vary by
            release as the catalog continues to grow; new tracks, metadata, artwork, and lyrics are
            added as the collection develops.
          </p>

          <h3>Music shaped by real experience</h3>
          <p>
            From alternative rap and emo rap to melodic rap and confessional songwriting, ATTIKID
            uses music to make sense of moments that leave a mark. Some songs are direct; others
            turn memories and emotions into metaphor. Together, they create an ongoing record of
            where the artist has been, what changed, and what still needs to be said. The aim is
            honesty rather than a perfect public persona, with room for contradiction, uncertainty,
            and the imperfect parts of being human.
          </p>
          <p>
            The project also treats lyrics and visuals as part of the same creative world. A song
            can stand on its own, but its meaning can shift when heard beside the album it belongs
            to, the time in which it was written, or the images created around it. The archive is
            built to connect those pieces instead of leaving each release isolated.
          </p>

          <h3>Explore the ATTIKID archive</h3>
          <nav className="home-seo-content__links" aria-label="Explore the ATTIKID website">
            <Link to="/music/albums">Browse albums and releases</Link>
            <Link to="/music/songs">Explore all songs</Link>
            <Link to="/lyrics">Read the lyrics archive</Link>
            <Link to="/videos">Watch music videos</Link>
            <Link to="/about">Read the ATTIKID artist story</Link>
            <Link to="/fan-mail">Contact ATTIKID</Link>
          </nav>
          <p>
            Start with the album archive for full releases, browse songs alphabetically to find a
            track, or visit the lyrics archive to explore published words. For background on the
            project and its creative identity, the <Link to="/about">About ATTIKID page</Link>
            explains the ideas behind the name, the music, and the wider archive.
          </p>
        </div>
      </section>
    </>
  );
}
