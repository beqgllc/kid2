import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { useAlbums, useFeaturedAlbum, useFeaturedSong, useLatestSongs, useSongs } from '../../hooks/useCatalog';
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
  const featured = useFeaturedAlbum();
  const featuredSongQuery = useFeaturedSong();
  const featuredTracks = useSongs(featured.data?.id, 12);
  const albums = useAlbums(8);
  const latestSongs = useLatestSongs(3);
  const [videos, setVideos] = useState<LyricVideo[]>([]);

  useEffect(() => {
    getLyricVideos().then(setVideos).catch(() => undefined);
  }, []);
  const setPlayer = usePlayerStore((state) => state.set);

  const playableTracks = useMemo(
    () => featuredTracks.data.filter((song): song is PlayerSong => Boolean(song.audio_url)),
    [featuredTracks.data],
  );

  const featuredSong = featuredSongQuery.data?.audio_url
    ? featuredSongQuery.data
    : playableTracks[0] ?? null;

  const playQueue = (queue = playableTracks, index = 0) => {
    if (!queue.length) return;
    const song = queue[index] ?? queue[0];
    if (!song?.audio_url) return;

    setPlayer({
      currentSong: song,
      queue,
      currentIndex: index,
      isPlaying: true,
      status: 'loading',
      currentTime: 0,
      error: null,
    });
  };

  const shareSite = async () => {
    const payload = { title: 'ATTIKID', text: 'ATTIKID — real music. Real shit.', url: window.location.href };
    try {
      if (navigator.share) await navigator.share(payload);
      else await navigator.clipboard.writeText(window.location.href);
    } catch {
      // User cancelled or clipboard/share is unavailable.
    }
  };

  const moreAlbums = albums.data
    .filter((album) => album.id !== featured.data?.id)
    .slice(0, 5);

  usePageMeta({
    title: 'ATTIKID | Official Music, Songs & Lyrics',
    description: 'Stream ATTIKID music, explore releases, visuals, and the story behind the songs.',
    canonical: 'https://attikid.vercel.app/',
    type: 'website',
    keywords: ['ATTIKID', 'music', 'albums', 'songs', 'visuals', 'artist'],
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
            <p>I&apos;m Attikid. I make music about the things most people don&apos;t talk about. This is my space — my music, my story, my chaos. Thanks for being here.</p>
            <div className="button-row">
              <button className="button" type="button" onClick={() => playQueue()} disabled={!featuredSong && !playableTracks.length}>
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
            <h2>{featured.data?.title ?? 'Trauma & Shit'}</h2>
            <div className="featured-release-meta">
              {releaseYear(featured.data?.release_date)} <span>•</span> {featured.data?.song_count ?? featuredTracks.data.length} TRACKS
            </div>
            <p>{featured.data?.description ?? 'The latest chapter in the ATTIKID catalog.'}</p>
            <div className="button-row">
              <button className="button" type="button" onClick={() => playQueue()} disabled={!playableTracks.length}>Play album</button>
              {featured.data && <Link className="button secondary" to={`/music/${featured.data.slug}`}>View release</Link>}
            </div>
          </div>

          <div className="featured-tracklist">
            {featuredTracks.loading && <div className="portfolio-muted">Loading tracks…</div>}
            {!featuredTracks.loading && featuredTracks.data.length === 0 && <div className="portfolio-muted">Tracks will appear here after ingest.</div>}
            {featuredTracks.data.slice(0, 9).map((song, index) => (
              <button
                type="button"
                className="featured-track"
                key={song.id}
                onClick={() => song.audio_url ? playQueue(playableTracks, Math.max(0, playableTracks.findIndex((item) => item.id === song.id))) : undefined}
                disabled={!song.audio_url}
              >
                <span className="featured-track__play">{song.audio_url ? (featuredSong?.id === song.id ? '▶' : '·') : '—'}</span>
                <span className="featured-track__number">{String(index + 1).padStart(2, '0')}</span>
                <span className="featured-track__title">{song.title}</span>
                <span className="featured-track__time">{formatDuration(song.duration_seconds ?? 0)}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="portfolio-section">
          <div className="portfolio-section__heading">
            <div>
              <span className="portfolio-label">MORE MUSIC</span>
              <h2>Releases</h2>
            </div>
            <Link to="/music">View all →</Link>
          </div>
          <div className="release-grid">
            {moreAlbums.length ? moreAlbums.map((album) => (
              <Link className="release-card" to={`/music/${album.slug}`} key={album.id}>
                <div className="release-card__art">
                  {album.cover_url ? <img src={album.cover_url} alt={album.title} /> : <span>ATTIKID</span>}
                </div>
                <strong>{album.title}</strong>
                <span>{releaseYear(album.release_date)} <i>•</i> {album.song_count ?? 0} TRACKS</span>
              </Link>
            )) : (
              <div className="portfolio-muted">Your release catalog will appear here as it fills in.</div>
            )}
          </div>
        </section>

        <section className="portfolio-section portfolio-videos">
          <div className="portfolio-section__heading">
            <div>
              <span className="portfolio-label">LATEST VIDEOS</span>
              <h2>Visuals</h2>
            </div>
            <Link to="/videos">View all →</Link>
          </div>
          {videos.length ? (
            <div className="video-grid">
              {videos.slice(0, 4).map((video) => (
                <Link className="video-card" key={video.id} to="/visuals/lyric-videos">
                  <div className="video-card__thumb">
                    {video.thumbnail_url
                      ? <img src={video.thumbnail_url} alt="" />
                      : <div className="video-card__fallback">ATTIKID</div>}
                    <span className="video-card__play">▶</span>
                    {video.duration_seconds ? <span className="video-card__duration">{formatDuration(video.duration_seconds)}</span> : null}
                  </div>
                  <strong>{video.title}</strong>
                  <span>{video.song?.album_title ?? 'LYRIC VIDEO'}</span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="portfolio-muted">No published lyric videos yet.</div>
          )}
        </section>
      </div>

      <aside className="portfolio-aside">
        <section className="aside-note"><span>“SAME KID.<br />DIFFERENT DEMONS.”</span></section>
        <section className="aside-section">
          <span className="portfolio-label">STREAM ANYWHERE</span>
          <div className="stream-list">
            {['Spotify', 'Apple Music', 'YouTube Music', 'SoundCloud', 'Amazon Music'].map((service) => (
              <div className="stream-item" key={service}><span>{service.slice(0, 1)}</span>{service}</div>
            ))}
          </div>
        </section>
        <section className="aside-section aside-follow">
          <span className="portfolio-label">FOLLOW & SHARE</span>
          <div className="social-row">
            <a href="https://www.tiktok.com/@iamattikid" target="_blank" rel="noreferrer" aria-label="TikTok">♪</a>
            <button type="button" onClick={() => void shareSite()} aria-label="Share ATTIKID">↗</button>
            <Link to="/fan-mail" aria-label="Contact">✉</Link>
          </div>
        </section>
        <section className="aside-quote">“MUSIC IS JUST ANOTHER WAY FOR ME TO BE HONEST.”<small>— ATTIKID</small></section>
        <section className="aside-section community-card">
          <span className="portfolio-label">JOIN THE COMMUNITY</span>
          <p>Get updates, new releases, behind the scenes, and more.</p>
          <Link className="button" to="/fan-mail">Join the list →</Link>
        </section>
        <section className="aside-section activity">
          <span className="portfolio-label">RECENT ACTIVITY</span>
          {(latestSongs.data.length ? latestSongs.data : featuredTracks.data.slice(0, 3)).map((song) => (
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
