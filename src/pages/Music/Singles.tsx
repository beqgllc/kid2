import { useMemo } from 'react';
import { PortfolioPageHeader } from '../../components/portfolio/PortfolioPageHeader';
import { SongRow } from '../../components/music/SongRow';
import { useSongs } from '../../hooks/useCatalog';
import { buildWebSiteJsonLd, usePageMeta } from '../../lib/seo';

function formatReleaseDate(value: string | null | undefined) {
  if (!value) return 'Release date unavailable';
  return new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function MusicSingles() {
  const songs = useSongs();
  const singles = useMemo(
    () => songs.data
      .filter((song) => song.album_id === null)
      .sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' })),
    [songs.data],
  );

  usePageMeta({
    title: 'ATTIKID Singles',
    description: 'Browse ATTIKID tracks released outside of albums and larger releases.',
    canonical: 'https://attikid.vercel.app/music/singles',
    type: 'music',
    keywords: ['ATTIKID singles', 'single releases', 'songs'],
    image: '/images/hero/attikid-hero.webp',
    jsonLd: buildWebSiteJsonLd(),
  });

  return (
    <div className="page music-catalog-page">
      <PortfolioPageHeader
        eyebrow="CATALOG / SINGLES"
        title="The singles."
        description="Individual tracks that live outside the album releases."
        links={[
          { to: '/music/albums', label: 'Albums' },
          { to: '/music/a-z', label: 'A–Z' },
          { to: '/music/singles', label: 'Singles', active: true },
        ]}
      />

      <section className="portfolio-section page-section-tight">
        {songs.loading ? (
          <div className="loading-state">Loading singles…</div>
        ) : singles.length ? (
          <div className="single-list">
            {singles.map((song, index) => (
              <article className="single-list__item" key={song.id}>
                <div className="single-list__number">{String(index + 1).padStart(2, '0')}</div>
                <div className="single-list__main">
                  <SongRow song={song} index={index} songs={singles} />
                  <div className="single-list__details">
                    <span>{song.artist_name}</span>
                    <span>{formatReleaseDate(song.release_date)}</span>
                    <span>{song.metadata?.genre ?? 'Genre not supplied'}</span>
                    <span>{song.metadata?.ai_platform ?? 'AI platform not supplied'}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">No standalone singles have been ingested yet.</div>
        )}
      </section>
    </div>
  );
}
