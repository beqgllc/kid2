import { useEffect, useState } from 'react';
import { getLyricVideos } from '../../services/visuals';
import { usePageMeta } from '../../lib/seo';
import type { LyricVideo } from '../../types/models';

export function LyricVideos() {
  const [items, setItems] = useState<LyricVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  usePageMeta({
    title: 'Videos — ATTIKID',
    description: 'ATTIKID lyric videos.',
    canonical: 'https://attikid.vercel.app/videos',
    type: 'website',
    image: '/images/hero/attikid-hero.webp',
  });

  useEffect(() => {
    getLyricVideos()
      .then(setItems)
      .catch((err) => setError(err instanceof Error ? err.message : 'Unable to load lyric videos.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page lyric-video-portfolio-page">
      <header className="videos-minimal-header">
        <span className="portfolio-label">VIDEOS / LYRIC VIDEOS</span>
        <h1>Lyric videos.</h1>
      </header>

      {loading && <div className="loading-state">Loading lyric videos…</div>}
      {error && !loading && <div className="empty-state">{error}</div>}

      {!loading && !error && !items.length && <div className="empty-state">No lyric videos have been published yet.</div>}

      {!loading && !error && items.length > 0 && (
        <div className="lyric-video-only-grid">
          {items.map((item) => (
            <article className="lyric-video-only-card" key={item.id}>
              <div className="lyric-video-only-card__embed">
                <video controls preload="metadata" poster={item.thumbnail_url ?? undefined} playsInline>
                  {item.video_url && <source src={item.video_url} type={item.video_mime_type} />}
                </video>
              </div>
              <h2>{item.song?.title ?? item.title}</h2>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
