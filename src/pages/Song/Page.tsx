import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useSong } from '../../hooks/useCatalog';
import { getLyrics } from '../../services/lyrics';
import { LyricsViewer } from '../../components/lyrics/LyricsViewer';
import { ReactionBar } from '../../components/engagement/ReactionBar';
import { Comments } from '../../components/comments/Comments';
import { usePlayerStore } from '../../stores/playerStore';
import type { Lyrics } from '../../types/models';
import { buildSongJsonLd, buildWebSiteJsonLd, usePageMeta } from '../../lib/seo';

export function Song() {
  const { songSlug = '' } = useParams();
  const { data: song, loading } = useSong(songSlug);
  const [lyrics, setLyrics] = useState<Lyrics | null>(null);
  const set = usePlayerStore((state) => state.set);

  useEffect(() => {
    if (song) getLyrics(song.id).then(setLyrics).catch(() => null);
  }, [song]);

  usePageMeta({
    title: song ? `${song.title} — ATTIKID` : 'ATTIKID Song',
    description: song ? `Listen to “${song.title}” by ATTIKID${song.album?.title ? ` from ${song.album.title}` : ''}.` : 'Listen to ATTIKID music and lyrics.',
    canonical: song ? `https://attikid.vercel.app/song/${song.slug}` : 'https://attikid.vercel.app/music',
    type: 'music.song',
    keywords: song ? ['ATTIKID', song.title, 'lyrics', 'music'] : ['ATTIKID', 'music', 'lyrics'],
    image: song?.artwork_url ?? '/images/hero/attikid-hero.webp',
    jsonLd: song ? buildSongJsonLd(song) : buildWebSiteJsonLd(),
  });

  if (loading) return <div className="page"><div className="loading-state">Loading song…</div></div>;
  if (!song) return <div className="center-page"><h1>Track not found.</h1><Link className="button" to="/music">Back to music</Link></div>;

  const play = () => song.audio_url && set({ currentSong: song as any, queue: [song] as any, currentIndex: 0, isPlaying: true, status: 'loading', error: null });

  return (
    <div className="page song-portfolio-page">
      <div className="detail-context">
        <span className="portfolio-label">MUSIC / TRACK</span>
        <div>
          <Link to="/music">Music archive</Link>
          {song.album && <><span className="detail-context__slash">/</span><Link to={`/music/${song.album.slug}`}>{song.album.title}</Link></>}
        </div>
      </div>
      <section className="song-detail-hero">
        <div className="song-detail-art">
          {song.artwork_url ? <img src={song.artwork_url} alt={`${song.title} artwork`} /> : <span>ATTIKID</span>}
        </div>
        <div className="song-detail-copy">
          <span className="portfolio-label">{song.album?.title ?? 'SINGLE'} / TRACK</span>
          <h1>{song.title}</h1>
          <p className="song-detail-artist">{song.artist_name}</p>
          <div className="button-row">
            <button className="button" onClick={play} disabled={!song.audio_url}>Play →</button>
            <Link className="button secondary" to={`/lyrics/${song.slug}`}>Lyrics</Link>
            {song.album && <Link className="button secondary" to={`/music/${song.album.slug}`}>View release</Link>}
          </div>
          <ReactionBar songId={song.id} />
        </div>
      </section>

      <section className="song-detail-body">
        <div>
          <div className="portfolio-section__heading"><div><span className="portfolio-label">WORDS</span><h2>Lyrics</h2></div></div>
          {lyrics ? <LyricsViewer content={lyrics.content} /> : <p className="portfolio-muted">Lyrics haven&apos;t been added yet.</p>}
        </div>
        <aside className="song-detail-facts">
          <span className="portfolio-label">TRACK INFO</span>
          <dl>
            <div><dt>Artist</dt><dd>{song.artist_name}</dd></div>
            <div><dt>Release</dt><dd>{song.album?.title ?? 'Single'}</dd></div>
            <div><dt>Genre</dt><dd>{song.metadata?.genre ?? '—'}</dd></div>
            <div><dt>Release date</dt><dd>{song.release_date ? new Date(song.release_date).toLocaleDateString() : '—'}</dd></div>
            <div><dt>Duration</dt><dd>{song.duration_seconds ? `${Math.floor(song.duration_seconds / 60)}:${String(song.duration_seconds % 60).padStart(2, '0')}` : '—'}</dd>
          </dl>
        </aside>
      </section>

      <Comments songId={song.id} />
    </div>
  );
}
