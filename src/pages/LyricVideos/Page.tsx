import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PortfolioPageHeader } from '../../components/portfolio/PortfolioPageHeader';
import { getLyricVideos } from '../../services/visuals';
import { usePageMeta } from '../../lib/seo';
import type { LyricVideo } from '../../types/models';

function duration(seconds: number | null) {
  if (!seconds) return '';
  return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
}

export function LyricVideos() {
  const [items, setItems] = useState<LyricVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  usePageMeta({
    title: 'Lyric Videos — ATTIKID',
    description: 'Watch ATTIKID lyric videos and visual releases.',
    canonical: 'https://attikid.vercel.app/visuals/lyric-videos',
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
      <PortfolioPageHeader
        eyebrow="VIDEOS / LYRIC FILMS"
        title="Words in motion."
        description="The visual side of the catalog — every published lyric video in one place."
        links={[
          { to: '/videos', label: 'All visuals' },
          { to: '/visuals/lyric-videos', label: 'Lyric videos', active: true },
        ]}
      />

      {loading && <div className="loading-state">Loading lyric videos…</div>}
      {error && <div className="empty-state">{error}</div>}
      {!loading && !error && !items.length && <div className="empty-state">No lyric videos have been published yet.</div>}

      <div className="lyric-video-portfolio-grid">
        {items.map((item) => (
          <article className="lyric-video-portfolio-card" key={item.id}>
            <div className="lyric-video-portfolio-frame">
              <video controls preload="metadata" poster={item.thumbnail_url ?? undefined} playsInline>
                {item.video_url && <source src={item.video_url} type={item.video_mime_type} />}
              </video>
              {item.duration_seconds ? <span className="lyric-video-portfolio-duration">{duration(item.duration_seconds)}</span> : null}
            </div>
            <div className="lyric-video-portfolio-meta">
              <span className="portfolio-label">LYRIC VIDEO</span>
              <h2>{item.title}</h2>
              <p>{item.song?.album_title ?? 'ATTIKID'} <span>•</span> {item.song?.artist_name ?? 'ATTIKID'}</p>
              {item.song?.slug && <Link className="text-link" to={`/song/${item.song.slug}`}>Open track →</Link>}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
