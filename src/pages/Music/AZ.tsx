import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { SongRow } from '../../components/music/SongRow';
import { useSongs } from '../../hooks/useCatalog';
import { buildWebSiteJsonLd, usePageMeta } from '../../lib/seo';

export function MusicAZ(){
  const songs = useSongs();
  const sorted = useMemo(
    () => songs.data.slice().sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' })),
    [songs.data],
  );

  const groups = useMemo(() => {
    const grouped = new Map<string, typeof sorted>();
    sorted.forEach((song) => {
      const letter = song.title.trim().charAt(0).toUpperCase() || '#';
      const existing = grouped.get(letter) ?? [];
      existing.push(song);
      grouped.set(letter, existing);
    });
    return [...grouped.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [sorted]);

  usePageMeta({
    title: 'ATTIKID Music A-Z',
    description: 'Browse every ATTIKID track alphabetically across albums and single releases.',
    canonical: 'https://attikid.vercel.app/music/a-z',
    type: 'music',
    keywords: ['ATTIKID songs', 'A-Z', 'tracks', 'music catalog'],
    image: '/images/hero/hero-music.webp',
    jsonLd: buildWebSiteJsonLd()
  });

  return (
    <div className="page music-catalog-page">
      <header className="page-hero">
        <span className="eyebrow">CATALOG / A-Z</span>
        <h1>Every track.</h1>
        <p>All ATTIKID songs, alphabetized regardless of release type.</p>
        <div className="music-page-links">
          <Link className="active" to="/music/a-z">A-Z</Link>
          <Link to="/music/albums">Albums</Link>
          <Link to="/music/singles">Singles</Link>
        </div>
      </header>

      <section className="content-section">
        {songs.loading ? <div className="loading-state">Loading tracks…</div> : groups.length ? (
          <div className="music-az-list">
            {groups.map(([letter, items]) => (
              <section key={letter}>
                <div className="music-az-letter">{letter}</div>
                <div className="song-list">
                  {items.map((song) => <SongRow key={song.id} song={song} index={sorted.findIndex((item) => item.id === song.id)} songs={sorted}/>)}
                </div>
              </section>
            ))}
          </div>
        ) : <div className="empty-state">No tracks have been ingested yet.</div>}
      </section>
    </div>
  );
}
