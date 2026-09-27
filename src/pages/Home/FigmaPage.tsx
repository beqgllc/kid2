import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { useAlbum, useAlbums, useSongByTitle, useSongs } from '../../hooks/useCatalog';
import { usePlayerStore } from '../../stores/playerStore';
import { formatDuration } from '../../lib/utils';
import type { PlayerSong } from '../../types/models';
import { usePageMeta } from '../../lib/seo';
import { getLyricVideos } from '../../services/visuals';
import type { LyricVideo } from '../../types/models';
import { AdminAuthModal } from '../Admin/Login';

function releaseYear(value?: string | null) {
  if (!value) return '—';
  const year = new Date(value).getFullYear();
  return Number.isFinite(year) ? String(year) : '—';
}

const CLOUDY_WITH_A_CHANCE_TRACKLIST = [
  "Men don't cry", "Problems on problems", "Checkmate", "Today", "Don't Forget",
  "Happy Birthday", "Let me fly", "One day", "Paranoid", "Drowning", "Change me", "Falling", "Funeral",
] as const;

function trackKey(value: string) {
  return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ');
}

export function FigmaHome() {
  const featured = useAlbum('cloudy-with-a-chance');
  const albums = useAlbums(5);
  const catalogSongs = useSongs();
  const [lyricVideos, setLyricVideos] = useState<LyricVideo[]>([]);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const { currentSong, isPlaying, currentTime, duration, set } = usePlayerStore();

  useEffect(() => { getLyricVideos().then(setLyricVideos).catch(() => setLyricVideos([])); }, []);

  const featuredTrackRows = useMemo(() => CLOUDY_WITH_A_CHANCE_TRACKLIST.map((title) => ({
    title,
    song: catalogSongs.data.find((song) => trackKey(song.title) === trackKey(title)) ?? null,
  })), [catalogSongs.data]);

  const playableTracks = useMemo(
    () => featuredTrackRows.map((row) => row.song).filter((song): song is PlayerSong => Boolean(song?.audio_url)),
    [featuredTrackRows],
  );

  const playQueue = (source: PlayerSong[] = playableTracks, index = 0) => {
    if (!source.length) return;
    const safeIndex = Math.max(0, Math.min(index, source.length - 1));
    const song = source[safeIndex];
    if (!song?.audio_url) return;
    set({ currentSong: song, queue: source, currentIndex: safeIndex, isPlaying: true, status: 'loading', currentTime: 0, error: null });
  };

  const toggleHeroPlayer = () => {
    if (!currentSong) { playQueue(); return; }
    set({ isPlaying: !isPlaying });
  };

  usePageMeta({
    title: 'ATTIKID | Official Music, Songs & Lyrics',
    description: 'ATTIKID — music, releases, visuals, and the story behind the songs.',
    canonical: 'https://attikid.vercel.app/', type: 'website',
    keywords: ['ATTIKID', 'music', 'albums', 'songs', 'videos', 'artist'], image: '/images/hero/attikid-hero.webp',
  });

  return (
    <div className="figma-home">
      <section className="figma-hero">
        <img className="figma-hero__image" src="/images/hero/attikid-hero.webp" alt="ATTIKID on a rooftop at sunset" fetchPriority="high" decoding="async" />
        <div className="figma-hero__veil" />
        <div className="figma-hero__copy">
          <p>I&apos;m Attikid. I make music about the things most people don&apos;t talk about. This is my space — my music, my story, my chaos. Thanks for being here.</p>
          <div className="figma-hero__actions">
            <button className="figma-cta figma-cta--primary" type="button" onClick={() => playQueue()} disabled={!playableTracks.length}>LISTEN NOW <span>→</span></button>
            <Link className="figma-cta figma-cta--secondary" to="/about">ENTER THE STORY <span>→</span></Link>
          </div>
        </div>
        <div className="figma-hero-player" aria-label="ATTIKID audio player">
          <div className="figma-hero-player__status">{isPlaying ? 'PLAYING' : currentSong ? 'PAUSED' : 'SELECT A TRACK'}</div>
          <div className="figma-hero-player__row">
            <button type="button" className="figma-player-play" onClick={toggleHeroPlayer} disabled={!playableTracks.length} aria-label={isPlaying ? 'Pause music' : 'Play music'}>{isPlaying ? 'Ⅱ' : '▶'}</button>
            <div className="figma-hero-player__track">
              <strong>{currentSong?.title ?? 'Cloudy With A Chance'}</strong>
              <span>ATTIKID · {formatDuration(currentTime)} / {formatDuration(duration)}</span>
            </div>
          </div>
          <div className="figma-player-progress" aria-hidden="true"><span style={{ width: (duration ? Math.min(100, (currentTime / duration) * 100) : 0) + '%' }} /></div>
        </div>
      </section>

      <section className="figma-stream" id="stream">
        <div className="figma-rule" />
        <div className="figma-stream__copy"><span>STREAM</span><h2>LISTEN WHEREVER YOU ARE.</h2><p>Available on your favorite platforms.</p></div>
        <div className="figma-stream__buttons">
          <a href="https://open.spotify.com/artist/7gZqcmdAs7JRUsHmYtRK0M" target="_blank" rel="noreferrer">SPOTIFY</a>
          <a href="https://music.apple.com/gr/artist/t-lee/1870158101" target="_blank" rel="noreferrer">APPLE MUSIC</a>
          <a href="https://soundcloud.com/attikid" target="_blank" rel="noreferrer">SOUNDCLOUD</a>
          <a href="https://tidal.com/browse/artist/" target="_blank" rel="noreferrer">TIDAL</a>
        </div>
        <div className="figma-featured">
          <div className="figma-featured__art">{featured.data?.cover_url ? <img src={featured.data.cover_url} alt="Cloudy With A Chance" /> : <span>ATTIKID</span>}</div>
          <div className="figma-featured__copy"><span>FEATURED RELEASE</span><h2>{featured.data?.title ?? 'CLOUDY WITH A CHANCE'}</h2><p>{releaseYear(featured.data?.release_date)} · {CLOUDY_WITH_A_CHANCE_TRACKLIST.length} TRACKS</p><button type="button" onClick={() => playQueue()} disabled={!playableTracks.length}>LISTEN NOW <span>→</span></button></div>
        </div>
      </section>

      <section className="figma-releases">
        <div className="figma-rule" />
        <div className="figma-section-head"><div><span>RELEASES</span><h2>THE CATALOG.</h2></div><Link to="/music/albums">VIEW ALL <b>→</b></Link></div>
        <div className="figma-release-grid">
          {albums.loading ? <div className="figma-muted">Loading releases…</div> : albums.data.slice(0, 5).map((item) => {
            const configured = Number(item.metadata?.config_track_count);
            const count = Number.isFinite(configured) && configured > 0 ? configured : catalogSongs.data.filter((song) => song.album_id === item.id).length;
            return <Link className="figma-release-card" to={'/music/' + item.slug} key={item.id}>
              <div className="figma-release-card__art">{item.cover_url ? <img src={item.cover_url} alt={item.title + ' cover'} loading="lazy" /> : <span>ATTIKID</span>}</div>
              <strong>{item.title}</strong><span>{releaseYear(item.release_date)} <i>•</i> {count} TRACKS</span>
            </Link>;
          })}
        </div>
      </section>

      <section className="figma-videos">
        <div className="figma-rule" />
        <div className="figma-section-head"><div><span>VIDEOS</span><h2>VISUALS.</h2></div><Link to="/videos">VIEW ALL <b>→</b></Link></div>
        <div className="figma-video-grid">
          {lyricVideos.slice(0, 3).map((video, index) => <article className="figma-video-card" key={video.id ?? video.video_url ?? index}>
            <div className="figma-video-card__media">{video.thumbnail_url ? <img src={video.thumbnail_url} alt="" loading="lazy" /> : <div className="figma-video-card__fallback">VIDEO / {index + 1}</div>}<span>▶</span></div>
            <strong>{video.song?.title ?? ['Let me fly', 'Today', 'Funeral'][index] ?? 'ATTIKID visual'}</strong><small>ATTIKID · LYRIC VIDEO</small>
          </article>)}
          {!lyricVideos.length && <div className="figma-video-empty">Visual archive loading…</div>}
        </div>
      </section>

      <section className="figma-about">
        <div className="figma-rule" />
        <div className="figma-about__image"><img src="/images/artist/kid-portrait-primary.webp" alt="Portrait of ATTIKID" loading="lazy" /></div>
        <div className="figma-about__copy"><span>ABOUT</span><h2>THE KID BEHIND THE MUSIC.</h2><p>ATTIKID is a place for the songs that come from the messy parts of life — the pressure, recovery, love, loss, and everything that does not fit neatly into a caption.</p><p>The catalog is the story. Every release adds another page.</p><Link className="figma-about__cta" to="/about">LEARN MORE <span>→</span></Link></div>
      </section>

      <section className="figma-admin-access"><button type="button" onClick={() => setAdminModalOpen(true)} aria-label="Open admin login">ADMIN</button></section>
      <AdminAuthModal open={adminModalOpen} onClose={() => setAdminModalOpen(false)} />
    </div>
  );
}
