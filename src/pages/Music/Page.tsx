import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { PortfolioPageHeader } from '../../components/portfolio/PortfolioPageHeader';
import { MusicSearch } from '../../components/music/MusicSearch';
import { useAlbums, useSongs } from '../../hooks/useCatalog';
import { usePageMeta } from '../../lib/seo';
import type { Song } from '../../types/models';
import './albums.css';

function coverFor(title: string, fallback?: string | null) {
  const key = title.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ');
  const covers: Record<string, string> = {
    'cloudy with a chance': '/images/new/cover/cloudywithachance.webp',
    'dead flowers still bloom': '/images/new/cover/deadflowersstillbloom.webp',
    'misery motel': '/images/new/cover/miserymotel.webp',
    'more trauma and shit': '/images/new/cover/moretraumaandshit.webp',
    'trauma and shit': '/images/new/cover/traumaandshit.webp',
  };
  return covers[key] ?? fallback ?? null;
}

function year(value?: string | null) {
  if (!value) return '—';
  return String(new Date(value).getFullYear());
}

export function Music() {
  const albums = useAlbums();
  const songs = useSongs();
  const [query, setQuery] = useState('');
  const carouselRef = useRef<HTMLDivElement>(null);
  const scrollAlbums = (direction: -1 | 1) => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    const slide = carousel.querySelector<HTMLElement>('.album-hover-card');
    carousel.scrollBy({ left: direction * ((slide?.offsetWidth ?? carousel.clientWidth) + 20), behavior: 'smooth' });
  };
  const tracksByAlbum = songs.data.reduce<Record<string, Song[]>>((groups, song) => {
    if (!song.album_id) return groups;
    (groups[song.album_id] ??= []).push(song);
    return groups;
  }, {});
  Object.values(tracksByAlbum).forEach((tracks) => tracks.sort((a, b) => (a.track_number ?? 999) - (b.track_number ?? 999)));
  const normalizedQuery = query.trim().toLowerCase();
  const visibleAlbums = albums.data.filter((album) => !normalizedQuery
    || album.title.toLowerCase().includes(normalizedQuery)
    || (tracksByAlbum[album.id] ?? []).some((track) => track.title.toLowerCase().includes(normalizedQuery)));

  usePageMeta({
    title: 'ATTIKID Music | Albums & Releases',
    description: 'Browse ATTIKID albums and releases with covers, tracklists, details, and stories.',
    canonical: 'https://attikid.vercel.app/music/albums',
    type: 'music',
    keywords: ['ATTIKID music', 'albums', 'tracklists', 'music catalog'],
    image: '/images/hero/attikid-hero.webp',
  });

  return (
    <div className="page music-portfolio-page">
      <PortfolioPageHeader
        eyebrow="MUSIC / ALBUMS"
        title="The albums."
        description="Every ATTIKID album, presented with the same editorial treatment as the records themselves."
        links={[
          { to: '/music/albums', label: 'Albums', active: true },
          { to: '/music/songs', label: 'Songs' },
        ]}
      />

      <section id="album-archive" className="portfolio-section page-section-tight">
        <MusicSearch mode="albums" songs={songs.data} albums={albums.data} query={query} onQueryChange={setQuery} />
        <p className="music-search__status" aria-live="polite">
          {normalizedQuery ? `${visibleAlbums.length} matching releases` : `${albums.data.length} releases`}
        </p>
        <div className="portfolio-section__heading">
          <div>
            <span className="portfolio-label">ALBUM ARCHIVE</span>
            <h2>Every record.</h2>
          </div>
          <span className="portfolio-muted">{visibleAlbums.length} releases</span>
        </div>

        {albums.loading || songs.loading ? (
          <div className="loading-state">Loading album archive…</div>
        ) : visibleAlbums.length ? (
          <>
          <div className="album-carousel-controls">
            <span className="portfolio-muted">Swipe or scroll to browse every album and tracklist.</span>
            <div>
              <button type="button" aria-label="Previous album" onClick={() => scrollAlbums(-1)}>←</button>
              <button type="button" aria-label="Next album" onClick={() => scrollAlbums(1)}>→</button>
            </div>
          </div>
          <div className="music-release-grid album-cover-carousel" ref={carouselRef} role="region" aria-label="Album carousel">
            {visibleAlbums.map((album) => {
              const tracks = tracksByAlbum[album.id] ?? [];
              const configuredTrackCount = Number(album.metadata?.config_track_count);
              const detailTrackCount = Number.isFinite(configuredTrackCount) && configuredTrackCount > 0
                ? configuredTrackCount
                : tracks.length;

              return (
                <article className="music-release-card album-hover-card" key={album.id} aria-label={`${album.title} album and tracklist`}>
                  <Link to={`/music/${album.slug}`} className="music-release-card__art">
                    {coverFor(album.title, album.cover_url)
                      ? <img src={coverFor(album.title, album.cover_url)!} alt={`${album.title} cover`} />
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
          </>
        ) : (
          <div className="empty-state">{normalizedQuery ? `No releases or tracks match “${query.trim()}”.` : 'No album releases have been ingested yet.'}</div>
        )}
      </section>
    </div>
  );
}
