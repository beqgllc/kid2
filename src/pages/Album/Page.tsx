import { useParams, Link } from 'react-router-dom';
import { useAlbum, useAlbums, useSongs } from '../../hooks/useCatalog';
import { usePlayerStore } from '../../stores/playerStore';
import { usePageMeta, buildAlbumJsonLd, buildWebSiteJsonLd } from '../../lib/seo';
import { formatDuration } from '../../lib/utils';

function year(value?: string | null) {
  if (!value) return '—';
  return String(new Date(value).getFullYear());
}

export function Album() {
  const { albumSlug = '' } = useParams();
  const album = useAlbum(albumSlug);
  const songs = useSongs(album.data?.id);
  const albums = useAlbums(8);
  const set = usePlayerStore((state) => state.set);

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

  const playable = songs.data.filter((song) => song.audio_url);
  const playAlbum = () => {
    if (!playable.length) return;
    set({ queue: playable as any, currentSong: playable[0] as any, currentIndex: 0, isPlaying: true, status: 'loading', error: null });
  };

  const related = albums.data.filter((item) => item.id !== album.data?.id).slice(0, 4);

  return (
    <div className="page album-portfolio-page">
      <section className="album-detail-hero">
        <div className="album-detail-art">
          {album.data.cover_url ? <img src={album.data.cover_url} alt={`${album.data.title} cover`} /> : <span>ATTIKID</span>}
        </div>
        <div className="album-detail-copy">
          <span className="portfolio-label">RELEASE / {year(album.data.release_date)}</span>
          <h1>{album.data.title}</h1>
          <div className="album-detail-meta">{album.data.artist_name} <span>•</span> {songs.data.length || album.data.song_count || 0} TRACKS</div>
          {album.data.description && <p>{album.data.description}</p>}
          <div className="button-row">
            <button className="button" type="button" onClick={playAlbum} disabled={!playable.length}>Play album →</button>
            <Link className="button secondary" to="/music">Back to music</Link>
          </div>
        </div>
      </section>

      <section className="album-detail-section">
        <div className="portfolio-section__heading">
          <div><span className="portfolio-label">TRACKLIST</span><h2>The songs.</h2></div>
          <span className="portfolio-muted">{songs.data.length} tracks</span>
        </div>
        <div className="album-detail-tracks">
          {songs.loading ? <div className="loading-state">Loading tracks…</div> : songs.data.map((song, index) => (
            <button
              className="album-detail-track"
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
