import { Link } from 'react-router-dom';
import { PortfolioPageHeader } from '../../components/portfolio/PortfolioPageHeader';
import { useAlbums, useSongs } from '../../hooks/useCatalog';
import { usePageMeta } from '../../lib/seo';
import type { Song } from '../../types/models';

function year(value?: string | null) {
  if (!value) return '—';
  return String(new Date(value).getFullYear());
}

export function Music() {
  const albums = useAlbums(12);
  const songs = useSongs();
  const tracksByAlbum = songs.data.reduce<Record<string, Song[]>>((groups, song) => {
    if (!song.album_id) return groups;
    (groups[song.album_id] ??= []).push(song);
    return groups;
  }, {});

  usePageMeta({
    title: 'ATTIKID Albums',
    description: 'Browse every ATTIKID album with its cover, full tracklist, release details, and story.',
    canonical: 'https://attikid.vercel.app/music/albums',
    type: 'music',
    keywords: ['ATTIKID music', 'albums', 'tracklists', 'music catalog'],
    image: '/images/hero/attikid-hero.webp',
  });

  return (
    <div className="page music-portfolio-page">
      <PortfolioPageHeader
        eyebrow="CATALOG / ALBUMS"
        title="The albums."
        description="Every ATTIKID album, presented with the same editorial treatment as the records themselves."
        links={[
          { to: '/music/albums', label: 'Albums', active: true },
          { to: '/music/a-z', label: 'A–Z' },
        ]}
      />

      <section className="portfolio-section page-section-tight">
        <div className="portfolio-section__heading">
          <div>
            <span className="portfolio-label">ALBUM ARCHIVE</span>
            <h2>Every record.</h2>
          </div>
          <span className="portfolio-muted">{albums.data.length} albums</span>
        </div>

        {albums.loading || songs.loading ? (
          <div className="loading-state">Loading album archive…</div>
        ) : albums.data.length ? (
          <div className="music-release-grid">
            {albums.data.map((album) => {
              const tracks = tracksByAlbum[album.id] ?? [];
              const configuredTrackCount = Number(album.metadata?.config_track_count);
              const detailTrackCount = Number.isFinite(configuredTrackCount) && configuredTrackCount > 0
                ? configuredTrackCount
                : tracks.length;

              return (
                <article className="music-release-card" key={album.id}>
                  <Link to={`/music/${album.slug}`} className="music-release-card__art">
                    {album.cover_url
                      ? <img src={album.cover_url} alt={`${album.title} cover`} />
                      : <span>ATTIKID</span>}
                  </Link>

                  <div className="music-release-card__body">
                    <span className="portfolio-label">{year(album.release_date)} / {detailTrackCount} TRACKS</span>
                    <h2><Link to={`/music/${album.slug}`}>{album.title}</Link></h2>

                    {album.artist_name && (
                      <div className="album-card-artist">{album.artist_name}</div>
                    )}

                    {album.description && (
                      <div className="album-card-purpose">
                        <span className="portfolio-label">PURPOSE / STORY</span>
                        <p>{album.description}</p>
                      </div>
                    )}

                    <div className="music-release-card__tracks" aria-label={`${album.title} tracklist`}>
                      {tracks.length ? tracks.map((track, index) => (
                        <Link key={track.id} to={`/song/${track.slug}`}>
                          <span>{String(index + 1).padStart(2, '0')}</span>
                          <strong>{track.title}</strong>
                          <small>
                            {track.duration_seconds
                              ? Math.floor(track.duration_seconds / 60) + ':' + String(Math.floor(track.duration_seconds % 60)).padStart(2, '0')
                              : '—'}
                          </small>
                        </Link>
                      )) : (
                        <div className="portfolio-muted">No tracks have been connected to this album yet.</div>
                      )}
                    </div>

                    <div className="album-card-meta-line">
                      <span>CONFIG COUNT {detailTrackCount}</span>
                      <span>CATALOG TRACKS {tracks.length}</span>
                    </div>

                    <Link className="text-link" to={`/music/${album.slug}`}>Open album →</Link>
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
