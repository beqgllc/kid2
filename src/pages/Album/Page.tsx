import { useParams, Link } from 'react-router-dom';
import { useAlbum, useAlbums, useSongs } from '../../hooks/useCatalog';
import { usePlayerStore } from '../../stores/playerStore';
import { usePageMeta, buildAlbumJsonLd, buildWebSiteJsonLd } from '../../lib/seo';
import { formatDuration } from '../../lib/utils';

const CLOUDY_WITH_A_CHANCE_TRACKLIST = [
  "Men don't cry",
  "Problems on problems",
  "Checkmate",
  "Today",
  "Don't Forget",
  "Happy Birthday",
  "Let me fly",
  "One day",
  "Paranoid",
  "Drowning",
  "Change me",
  "Falling",
  "Funeral",
] as const;

function trackKey(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function year(value?: string | null) {
  if (!value) return '—';
  return String(new Date(value).getFullYear());
}

export function Album() {
  const { albumSlug = '' } = useParams();
  const album = useAlbum(albumSlug);
  const songs = useSongs(album.data?.id);
  const catalogSongs = useSongs(undefined, 100);
  const albums = useAlbums(8);
  const set = usePlayerStore((state) => state.set);
  const currentSong = usePlayerStore((state) => state.currentSong);

  usePageMeta({
    title: album.data ? `${album.data.title} — ATTIKID Album` : 'ATTIKID Album',
    description: album.data?.description ?? 'Listen to an ATTIKID album from the catalog.',
    canonical: album.data ? `https://attikid.vercel.app/music/${album.data.slug}` : 'https://attikid.vercel.app/music',
    type: 'music.album',
    keywords: album.data ? ['ATTIKID', album.data.title, 'album', 'music'] : ['ATTIKID', 'album', 'music'],
    image: album.data?.cover_url ?? '/images/hero/attikid-hero.webp',
    jsonLd: album.data ? buildAlbumJsonLd(album.data) : buildWebSiteJsonLd(),
  });

  if (album.loading) return <div className="page"><div className="loading-state">Loading release…</div></div>;
  if (!album.data) return <div className="center-page"><h1>Release not found.</h1><Link className="button" to="/music">Back to music</Link></div>;

  const displayTracks = album.data.slug === 'cloudy-with-a-chance'
    ? CLOUDY_WITH_A_CHANCE_TRACKLIST
      .map((title) => catalogSongs.data.find((song) => trackKey(song.title) === trackKey(title)) ?? null)
      .filter((song): song is NonNullable<typeof song> => Boolean(song))
    : songs.data;

  const playable = displayTracks.filter((song) => song.audio_url);
  const playAlbum = () => {
    if (!playable.length) return;
    set({ queue: playable as any, currentSong: playable[0] as any, currentIndex: 0, isPlaying: true, status: 'loading', error: null });
  };

  const related = albums.data.filter((item) => item.id !== album.data?.id).slice(0, 4);

  return (
    <div className="page album-portfolio-page">
      <div className="detail-context">
        <span className="portfolio-label">MUSIC / RELEASE</span>
        <Link to="/music/albums">Back to the album archive <span aria-hidden="true">↗</span></Link>
      </div>
      <section className="album-detail-hero">
        <div className="album-detail-art">
          {album.data.cover_url ? <img src={album.data.cover_url} alt={`${album.data.title} cover`} /> : <span>ATTIKID</span>}
        </div>
        <div className="album-detail-copy">
          <span className="portfolio-label">RELEASE / {year(album.data.release_date)}</span>
          <h1>{album.data.title}</h1>
          <div className="album-detail-meta">{album.data.artist_name} <span>•</span> {displayTracks.length || album.data.song_count || 0} TRACKS <span>•</span> CONFIG {album.data.slug === 'cloudy-with-a-chance' ? CLOUDY_WITH_A_CHANCE_TRACKLIST.length : Number(album.data.metadata?.config_track_count) || displayTracks.length || 0}</div>
          {album.data.description && <div className="album-detail-purpose"><span className="portfolio-label">PURPOSE / STORY</span><p>{album.data.description}</p></div>}
          <div className="button-row">
            <button className="button" type="button" onClick={playAlbum} disabled={!playable.length}>Play album →</button>
            <Link className="button secondary" to="/music/albums">Back to albums</Link>
          </div>
        </div>
      </section>

      <section className="album-detail-section">
        <div className="portfolio-section__heading">
          <div><span className="portfolio-label">TRACKLIST</span><h2>The songs.</h2></div>
          <span className="portfolio-muted">{displayTracks.length} tracks</span>
        </div>
        <div className="album-detail-tracks">
          {(songs.loading || (album.data.slug === 'cloudy-with-a-chance' && catalogSongs.loading)) ? (
            <div className="loading-state">Loading tracks…</div>
          ) : displayTracks.map((song, index) => (
            <button
              className={`album-detail-track${currentSong?.id === song.id ? ' is-current' : ''}`}
              key={song.id}
              type="button"
              disabled={!song.audio_url}
              onClick={() => song.audio_url && set({ queue: playable as any, currentSong: song as any, currentIndex: Math.max(0, playable.findIndex((item) => item.id === song.id)), isPlaying: true, status: 'loading', error: null })}
            >
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{song.title}</strong>
              <small>{song.metadata?.genre ?? '—'}</small>
              <em>{formatDuration(song.duration_seconds ?? 0)}</em>
            </button>
          ))}
        </div>
      </section>

      {related.length > 0 && (
        <section className="portfolio-section related-releases">
          <div className="portfolio-section__heading">
            <div><span className="portfolio-label">MORE MUSIC</span><h2>Related releases</h2></div>
          </div>
          <div className="release-grid">
            {related.map((item) => (
              <Link className="release-card" to={`/music/${item.slug}`} key={item.id}>
                <div className="release-card__art">{item.cover_url ? <img src={item.cover_url} alt={item.title} /> : <span>ATTIKID</span>}</div>
                <strong>{item.title}</strong>
                <span>{year(item.release_date)} <i>•</i> {item.song_count ?? 0} TRACKS</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
