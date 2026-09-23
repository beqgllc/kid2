import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { useAlbum, useLatestSongs, useSongByTitle, useSongs } from '../../hooks/useCatalog';
import { usePlayerStore } from '../../stores/playerStore';
import { formatDuration } from '../../lib/utils';
import type { PlayerSong } from '../../types/models';
import { usePageMeta } from '../../lib/seo';
import { getLyricVideos } from '../../services/visuals';
import type { LyricVideo } from '../../types/models';

function releaseYear(value?: string | null) {
  if (!value) return '—';
  const year = new Date(value).getFullYear();
  return Number.isFinite(year) ? String(year) : '—';
}

export function Home() {
  const featured = useAlbum('cloudy-with-a-chance');
  const tracks = useSongs(featured.data?.id, 20);
  const latestSongs = useLatestSongs(3);
  const letMeFly = useSongByTitle('Let me fly');
  const setPlayer = usePlayerStore((state) => state.set);
  const currentSong = usePlayerStore((state) => state.currentSong);

  const [lyricVideos, setLyricVideos] = useState<LyricVideo[]>([]);

  useEffect(() => {
    getLyricVideos().then(setLyricVideos).catch(() => setLyricVideos([]));
  }, []);

  const playableTracks = useMemo(
    () => tracks.data.filter((song): song is PlayerSong => Boolean(song.audio_url)),
    [tracks.data],
  );

  const playQueue = (queue = playableTracks, index = 0) => {
    if (!queue.length) return;
    const safeIndex = Math.max(0, Math.min(index, queue.length - 1));
    const song = queue[safeIndex];
    if (!song?.audio_url) return;

    setPlayer({
      currentSong: song,
      queue,
      currentIndex: safeIndex,
      isPlaying: true,
      status: 'loading',
      currentTime: 0,
      error: null,
    });
  };

  const shareSite = async () => {
    const payload = {
      title: 'ATTIKID',
      text: 'ATTIKID — real music. Real shit.',
      url: window.location.href,
    };
    try {
      if (navigator.share) await navigator.share(payload);
      else await navigator.clipboard.writeText(window.location.href);
    } catch {
      // User cancelled or share is unavailable.
    }
  };

  usePageMeta({
    title: 'ATTIKID | Official Music, Songs & Lyrics',
    description: 'Stream ATTIKID music, explore releases, visuals, and the story behind the songs.',
    canonical: 'https://attikid.vercel.app/',
    type: 'website',
    keywords: ['ATTIKID', 'music', 'albums', 'songs', 'videos', 'artist'],
    image: '/images/hero/attikid-hero.webp',
  });

  return (
    <div className="portfolio-home">
      <div className="portfolio-main">
        <section className="portfolio-hero">
          <img src="/images/hero/attikid-hero.webp" alt="ATTIKID on a rooftop at sunset" />
          <div className="portfolio-hero__veil" />
          <div className="portfolio-hero__copy">
            <span className="portfolio-label">ATTIKID / OFFICIAL SITE</span>
            <h1>ATTIKID</h1>
            <p>I&apos;m Attikid. I make music about the things most people don&apos;t talk about. This is my space — my music, my story, my chaos. Thanks for being here.</p>
            <div className="button-row">
              <button className="button" type="button" onClick={() => playQueue()} disabled={!playableTracks.length}>
                Listen now →
              </button>
              <Link className="button secondary" to="/about">Enter the story</Link>
            </div>
          </div>
        </section>

        <section className="portfolio-featured">
          <div className="featured-release-art">
            {featured.data?.cover_url
              ? <img src={featured.data.cover_url} alt={featured.data.title} />
              : <span>ATTIKID</span>}
          </div>

          <div className="featured-release-info">
            <span className="portfolio-label">FEATURED ALBUM</span>
            <h2>{featured.data?.title ?? 'Cloudy With A Chance'}</h2>
            <div className="featured-release-meta">
              {releaseYear(featured.data?.release_date)} <span>•</span> {featured.data?.song_count ?? tracks.data.length} TRACKS
            </div>
            <p>{featured.data?.description ?? 'The latest chapter in the ATTIKID catalog.'}</p>
            <div className="button-row">
              <button className="button" type="button" onClick={() => playQueue()} disabled={!playableTracks.length}>
                Play album
              </button>
              {featured.data && <Link className="button secondary" to={`/music/${featured.data.slug}`}>View album</Link>}
            </div>
          </div>

          <div className="featured-tracklist">
            {tracks.loading && <div className="portfolio-muted">Loading tracks…</div>}
            {!tracks.loading && tracks.data.length === 0 && <div className="portfolio-muted">Tracks will appear here after ingest.</div>}
            {tracks.data.map((song, index) => (
              <button
                type="button"
                className={`featured-track${currentSong?.id === song.id ? ' is-current' : ''}`}
                key={song.id}
                onClick={() => {
                  const queueIndex = playableTracks.findIndex((item) => item.id === song.id);
                  if (queueIndex >= 0) playQueue(playableTracks, queueIndex);
                }}
                disabled={!song.audio_url}
                aria-label={song.audio_url ? `Play ${song.title}` : `${song.title} unavailable`}
              >
                <span className="featured-track__play">{song.audio_url ? (currentSong?.id === song.id ? '▶' : '·') : '—'}</span>
                <span className="featured-track__number">{String(index + 1).padStart(2, '0')}</span>
                <span className="featured-track__title">{song.title}</span>
                <span className="featured-track__time">{formatDuration(song.duration_seconds ?? 0)}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="portfolio-section portfolio-videos">
          <div className="portfolio-section__heading">
            <div>
              <span className="portfolio-label">VISUALS</span>
              <h2>Let me fly</h2>
            </div>
            <Link to="/videos">View videos →</Link>
          </div>

          <article className="featured-lyric-video-card">
            <div className="featured-lyric-video-card__title">
              <span className="portfolio-label">ATTIKID / CLOUDY WITH A CHANCE</span>
              <h3>Let me fly</h3>
            </div>

            <div className="featured-lyric-video-card__embed">
              {lyricVideos.find((video) => video.song?.title?.toLowerCase() === 'let me fly') ? (
                (() => {
                  const video = lyricVideos.find((item) => item.song?.title?.toLowerCase() === 'let me fly');
                  return video ? (
                    <video controls preload="metadata" poster={video.thumbnail_url ?? undefined} playsInline>
                      {video.video_url && <source src={video.video_url} type={video.video_mime_type} />}
                    </video>
                  ) : null;
                })()
              ) : (
                <div className="video-unavailable">
                  <span className="portfolio-label">VIDEO PLAYER</span>
                  <strong>Let me fly</strong>
                  <p>The lyric video is not published to the video archive yet.</p>
                </div>
              )}
            </div>

            <div className="featured-lyric-video-card__actions">
              <Link className="button" to={letMeFly.data ? `/lyrics/${letMeFly.data.slug}` : '/lyrics'}>
                Read Let me fly lyrics
              </Link>
              <Link className="button secondary" to="/videos">
                Open Videos
              </Link>
            </div>
          </article>>
        </section>
      </div>

      <aside className="portfolio-aside">
        <section className="aside-note"><span>“SAME KID.<br />DIFFERENT DEMONS.”</span></section>

        <section className="aside-section aside-directory">
          <span className="portfolio-label">THE SPACE</span>
          <nav className="aside-directory__list" aria-label="ATTIKID quick links">
            <Link to="/music/albums"><span>01</span>Albums</Link>
            <Link to="/music/a-z"><span>02</span>A–Z music</Link>
            <Link to="/videos"><span>03</span>Videos</Link>
            <Link to="/lyrics"><span>04</span>Lyrics</Link>
            <Link to="/about"><span>05</span>The story</Link>
          </nav>
        </section>

        <section className="aside-section aside-follow">
          <span className="portfolio-label">FOLLOW &amp; SHARE</span>
          <div className="social-row social-row--brands" aria-label="ATTIKID social links">
            <a href="https://www.facebook.com/profile.php?id=61593540360842" target="_blank" rel="noreferrer" aria-label="Facebook" title="Facebook"><span aria-hidden="true">f</span></a>
            <a href="https://www.soundcloud.com/attikid" target="_blank" rel="noreferrer" aria-label="SoundCloud" title="SoundCloud"><span aria-hidden="true">☁</span></a>
            <a href="https://open.spotify.com/artist/7gZqcmdAs7JRUsHmYtRK0M?si=we1o-AnBSlqVmzG0ZyxgPA" target="_blank" rel="noreferrer" aria-label="Spotify" title="Spotify"><span aria-hidden="true">●</span></a>
            <a href="https://tiktok.com/iamattikid" target="_blank" rel="noreferrer" aria-label="TikTok" title="TikTok"><span aria-hidden="true">♪</span></a>
            <a href="https://x.com/Attikid_" target="_blank" rel="noreferrer" aria-label="X" title="X"><span aria-hidden="true">𝕏</span></a>
            <button type="button" onClick={() => void shareSite()} aria-label="Share ATTIKID" title="Share ATTIKID">↗</button>
          </div>
        </section>

        <section className="aside-quote">
          “Music is just another way for me to be honest.”
          <small>— ATTIKID</small>
        </section>

        <section className="aside-section community-card">
          <span className="portfolio-label">JOIN THE COMMUNITY</span>
          <p>Get updates, new releases, behind the scenes, and more.</p>
          <Link className="button" to="/fan-mail">Join the list →</Link>
        </section>

        <section className="aside-section activity">
          <span className="portfolio-label">RECENT ACTIVITY</span>
          {(latestSongs.data.length ? latestSongs.data : tracks.data.slice(0, 3)).map((song) => (
            <Link className="activity-row" key={song.id} to={`/song/${song.slug}`}>
              <div className="activity-thumb">{song.artwork_url ? <img src={song.artwork_url} alt="" /> : <span />}</div>
              <div><strong>New song</strong><span>{song.title}</span></div>
            </Link>
          ))}
        </section>
      </aside>
    </div>
  );
}
