import { useEffect, useState } from 'react';
import { getLyricVideos } from '../../services/visuals';
import { usePageMeta } from '../../lib/seo';
import type { LyricVideo } from '../../types/models';

const LET_ME_FLY_VIDEO_ID = '7686115895256665357';
const LET_ME_FLY_VIDEO_URL = 'https://www.tiktok.com/@iamattikid/video/7686115895256665357';

function LetMeFlyEmbed() {
  useEffect(() => {
    const existing = document.querySelector('script[data-attikid-tiktok-embed]');
    if (existing) return;
    const script = document.createElement('script');
    script.src = 'https://www.tiktok.com/embed.js';
    script.async = true;
    script.dataset.attikidTiktokEmbed = 'true';
    document.body.appendChild(script);
  }, []);

  return (
    <article className="lyric-video-only-card">
      <div className="lyric-video-only-card__embed">
        <blockquote
          className="tiktok-embed"
          cite={LET_ME_FLY_VIDEO_URL}
          data-video-id={LET_ME_FLY_VIDEO_ID}
        >
          <section />
        </blockquote>
      </div>
      <h2>Let me fly</h2>
    </article>
  );
}

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

      {!loading && !error && !items.length && <LetMeFlyEmbed />}

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
