import { useEffect, useState } from 'react';
import { getLyricVideos } from '../../services/visuals';
import { usePageMeta } from '../../lib/seo';
import type { LyricVideo } from '../../types/models';
import './page.css';

export function LyricVideos() {
  const [items, setItems] = useState<LyricVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  usePageMeta({
    title: 'Lyric Videos — ATTIKID',
    description: 'Watch ATTIKID lyric videos and visual releases.',
    canonical: 'https://attikid.vercel.app/visuals/lyric-videos',
    type: 'website',
  });

  useEffect(() => {
    getLyricVideos()
      .then(setItems)
      .catch((err) => setError(err instanceof Error ? err.message : 'Unable to load lyric videos.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="lyric-videos-page">
      <header className="visuals-page__header">
        <span className="eyebrow">03 / VISUALS / LYRIC VIDEOS</span>
        <h1>Words in motion.</h1>
        <p>Lyric films for the ATTIKID catalog.</p>
      </header>

      {loading && <div className="loading-state">Loading lyric videos…</div>}
      {error && <div className="empty-state">{error}</div>}
      {!loading && !error && !items.length && (
        <div className="empty-state">No lyric videos have been published yet.</div>
      )}

      <div className="lyric-videos-grid">
        {items.map((item) => (
          <article className="lyric-video-card" key={item.id}>
            <div className="lyric-video-frame">
              <video
              controls
              preload="metadata"
              poster={item.thumbnail_url ?? undefined}
              playsInline
            >
              <source
              src={item.video_url ?? undefined}
              type={item.video_mime_type}
              />
              </video>
            </div>
            <div className="lyric-video-card__meta">
              <span className="eyebrow">LYRIC VIDEO</span>
              <h2>{item.title}</h2>
              <p>{item.song?.artist_name ?? 'ATTIKID'}{item.song?.album_title ? ` · ${item.song.album_title}` : ''}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
