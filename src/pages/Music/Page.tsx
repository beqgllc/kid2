import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { PortfolioPageHeader } from '../../components/portfolio/PortfolioPageHeader';
import { useAlbums, useSongs } from '../../hooks/useCatalog';
import { usePageMeta } from '../../lib/seo';

function year(value?: string | null) {
  if (!value) return '—';
  return String(new Date(value).getFullYear());
}

export function Music() {
  const albums = useAlbums(12);
  const songs = useSongs();
  const tracksByAlbum = useMemo(
    () => songs.data.reduce<Record<string, typeof songs.data>>((groups, song) => {
      if (!song.album_id) return groups;
      (groups[song.album_id] ??= []).push(song);
      return groups;
    }, {}),
    [songs.data],
  );

  usePageMeta({
    title: 'ATTIKID Music',
    description: 'Browse ATTIKID releases, albums, singles, stories, and track lists.',
    canonical: 'https://attikid.vercel.app/music/albums',
    type: 'music',
    keywords: ['ATTIKID music', 'albums', 'releases', 'songs'],
    image: '/images/hero/attikid-hero.webp',
  });

  return (
    <div className="page music-portfolio-page">
      <PortfolioPageHeader
        eyebrow="CATALOG / MUSIC"
        title="The records."
        description="Albums, singles, and the stories attached to them."
        links={[
          { to: '/music/albums', label: 'Albums', active: true },
          { to: '/music/singles', label: 'Singles' },
          { to: '/music/a-z', label: 'A–Z' },
        ]}
      />

      <section className="portfolio-section page-section-tight">
        <div className="portfolio-section__heading">
          <div>
            <span className="portfolio-label">RELEASES</span>
            <h2>Album catalog</h2>
          </div>
          <span className="portfolio-muted">{albums.data.length} releases</span>
        </div>

        {albums.loading || songs.loading ? (
          <div className="loading-state">Loading catalog…</div>
        ) : albums.data.length ? (
          <div className="music-release-grid">
            {albums.data.map((album) => {
              const tracks = tracksByAlbum[album.id] ?? [];
              return (
                <article className="music-release-card" key={album.id}>
                  <Link to={`/music/${album.slug}`} className="music-release-card__art">
                    {album.cover_url ? <img src={album.cover_url} alt={album.title} /> : <span>ATTIKID</span>}
                  </Link>
                  <div className="music-release-card__body">
                    <span className="portfolio-label">{year(album.release_date)} / {tracks.length} TRACKS</span>
                    <h2><Link to={`/music/${album.slug}`}>{album.title}</Link></h2>
                    {album.description && <p>{album.description}</p>}
                    <div className="music-release-card__tracks">
                      {tracks.slice(0, 5).map((track, index) => (
                        <Link key={track.id} to={`/song/${track.slug}`}>
                          <span>{String(index + 1).padStart(2, '0')}</span>
                          <strong>{track.title}</strong>
                          <small>{track.duration_seconds ? Math.floor(track.duration_seconds / 60) + ':' + String(track.duration_seconds % 60).padStart(2, '0') : '—'}</small>
                        </Link>
                      ))}
                    </div>
                    <Link className="text-link" to={`/music/${album.slug}`}>Open release →</Link>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">No album releases have been ingested yet.</div>
        )}
      </section>
    </div>
  );
}
