import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSongs } from '../../hooks/useCatalog';
import { getLyricsMap } from '../../services/lyrics';
import { buildWebSiteJsonLd, usePageMeta } from '../../lib/seo';

export function Lyrics() {
  const { data: songs, loading } = useSongs();
  const [search, setSearch] = useState('');
  const [ids, setIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (songs.length) {
      getLyricsMap(songs.map((song) => song.id))
        .then((map) => setIds(new Set(map.keys())))
        .catch(() => null);
    }
  }, [songs]);

  const groups = useMemo(() => {
    const result = new Map<string, typeof songs>();
    songs
      .filter((song) => ids.has(song.id) && song.title.toLowerCase().includes(search.toLowerCase()))
      .slice()
      .sort((a, b) => a.title.localeCompare(b.title))
      .forEach((song) => {
        const key = song.title.trim().charAt(0).toUpperCase() || '#';
        const group = result.get(key) ?? [];
        group.push(song);
        result.set(key, group);
      });
    return [...result.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [songs, ids, search]);

  usePageMeta({
    title: 'ATTIKID Lyrics Archive',
    description: 'Read ATTIKID lyrics and explore the written archive of songs and records.',
    canonical: 'https://attikid.vercel.app/lyrics',
    type: 'website',
    keywords: ['ATTIKID lyrics', 'lyrics archive', 'song words'],
    image: '/images/hero/attikid-hero.webp',
    jsonLd: buildWebSiteJsonLd(),
  });

  return (
    <div className="page lyrics-portfolio-page">
      <header className="catalog-hero">
        <div>
          <span className="portfolio-label">WORDS / ARCHIVE</span>
          <h1>The lyrics.</h1>
          <p>The written side of the catalog, indexed by song.</p>
        </div>
      </header>

      <section className="portfolio-section page-section-tight">
        <div className="lyrics-toolbar">
          <div>
            <span className="portfolio-label">SEARCH THE ARCHIVE</span>
            <h2>Find a song.</h2>
          </div>
          <input
            className="search-input"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search titles…"
            aria-label="Search lyrics"
          />
        </div>

        {loading ? (
          <div className="loading-state">Building lyric index…</div>
        ) : groups.length ? (
          <div className="lyrics-index">
            {groups.map(([letter, items]) => (
              <section key={letter}>
                <h2>{letter}</h2>
                {items.map((song) => (
                  <Link key={song.id} to={`/lyrics/${song.slug}`}>
                    <strong>{song.title}</strong>
                    <span>{song.album?.title ?? 'Single'}</span>
                  </Link>
                ))}
              </section>
            ))}
          </div>
        ) : (
          <div className="empty-state">No lyrics have been added yet.</div>
        )}
      </section>
    </div>
  );
}
