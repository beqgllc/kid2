import { useMemo, useState } from 'react';
import { PortfolioPageHeader } from '../../components/portfolio/PortfolioPageHeader';
import { MusicSearch } from '../../components/music/MusicSearch';
import { useAlbums } from '../../hooks/useCatalog';
import { SongRow } from '../../components/music/SongRow';
import { useSongs } from '../../hooks/useCatalog';
import { buildWebSiteJsonLd, usePageMeta } from '../../lib/seo';

export function MusicAZ() {
  const songs = useSongs();
  const albums = useAlbums();
  const [query, setQuery] = useState('');
  const sorted = useMemo(
    () => songs.data.slice().sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' })),
    [songs.data],
  );
  const filteredSongs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return sorted.filter((song) => song.title.toLowerCase().includes(normalizedQuery));
  }, [query, sorted]);

  const groups = useMemo(() => {
    const grouped = new Map<string, typeof filteredSongs>();
    filteredSongs.forEach((song) => {
      const letter = song.title.trim().charAt(0).toUpperCase() || '#';
      const existing = grouped.get(letter) ?? [];
      existing.push(song);
      grouped.set(letter, existing);
    });
    return [...grouped.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [filteredSongs]);

  usePageMeta({
    title: 'ATTIKID Music | Songs',
    description: 'Browse every ATTIKID track alphabetically across albums and single releases.',
    canonical: 'https://attikid.vercel.app/music/songs',
    type: 'music',
    keywords: ['ATTIKID songs', 'tracks', 'music catalog'],
    image: '/images/hero/attikid-hero.webp',
    jsonLd: buildWebSiteJsonLd(),
  });

  return (
    <div className="page music-catalog-page">
      <PortfolioPageHeader
        image="/images/new/hero/atozhero.webp"
        eyebrow="MUSIC / SONGS"
        title="Every track."
        description="Every ATTIKID song, alphabetized across albums and standalone releases."
        links={[
          { to: '/music/albums', label: 'Albums' },
          { to: '/music/songs', label: 'Songs', active: true },
        ]}
      />

      <section className="portfolio-section page-section-tight">
        <MusicSearch mode="songs" songs={sorted} albums={albums.data} query={query} onQueryChange={setQuery} />
        <p className="music-search__status" aria-live="polite">
          {query.trim() ? `${filteredSongs.length} matching ${filteredSongs.length === 1 ? 'track' : 'tracks'}` : `${sorted.length} tracks`}
        </p>

        {songs.loading ? (
          <div className="loading-state">Loading tracks…</div>
        ) : filteredSongs.length ? (
          <div className="music-az-list">
            {groups.map(([letter, items]) => (
              <section key={letter}>
                <div className="music-az-letter">{letter}</div>
                <div className="song-list">
                  {items.map((song) => (
                    <SongRow
                      key={song.id}
                      song={song}
                      index={sorted.findIndex((item) => item.id === song.id)}
                      songs={sorted}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : query.trim() ? (
          <div className="empty-state">No tracks match “{query.trim()}”.</div>
        ) : (
          <div className="empty-state">No tracks have been ingested yet.</div>
        )}
      </section>
    </div>
  );
}
