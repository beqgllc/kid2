import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSong } from '../../hooks/useCatalog';
import { getLyrics } from '../../services/lyrics';
import type { Lyrics as LyricsType } from '../../types/models';
import { LyricsViewer } from '../../components/lyrics/LyricsViewer';
import { PortfolioPageHeader } from '../../components/portfolio/PortfolioPageHeader';
import { buildSongJsonLd, buildWebSiteJsonLd, usePageMeta } from '../../lib/seo';

export function LyricsEntry() {
  const { songSlug = '' } = useParams();
  const { data: song, loading } = useSong(songSlug);
  const [lyrics, setLyrics] = useState<LyricsType | null>(null);

  useEffect(() => {
    if (song) getLyrics(song.id).then(setLyrics).catch(() => null);
  }, [song]);

  usePageMeta({
    title: song ? `${song.title} Lyrics — ATTIKID` : 'ATTIKID Lyrics',
    description: song ? `Read the lyrics for “${song.title}” by ATTIKID.` : 'Read ATTIKID lyrics from the catalog.',
    canonical: song ? `https://attikid.vercel.app/lyrics/${song.slug}` : 'https://attikid.vercel.app/lyrics',
    type: 'music.song',
    keywords: song ? ['ATTIKID lyrics', song.title, song.album?.title ?? 'album'] : ['ATTIKID lyrics', 'song lyrics'],
    image: song?.artwork_url ?? '/images/hero/attikid-hero.webp',
    jsonLd: song ? buildSongJsonLd(song) : buildWebSiteJsonLd(),
  });

  if (loading) return <div className="page"><div className="loading-state">Loading lyrics…</div></div>;
  if (!song) return <div className="center-page"><h1>Song not found.</h1><Link className="button" to="/lyrics">Lyrics index</Link></div>;

  return (
    <div className="page lyrics-entry-page">
      <PortfolioPageHeader
        eyebrow={`WORDS / ${song.album?.title?.toUpperCase() ?? 'SINGLE'}`}
        title={song.title}
        description={`${song.artist_name} — the written side of the track.`}
        links={[
          { to: '/lyrics', label: 'Lyrics index' },
          { to: `/song/${song.slug}`, label: 'Track page' },
        ]}
      />
      <section className="lyrics-entry-layout">
        <div className="lyrics-entry-copy">
          <span className="portfolio-label">THE WORDS</span>
          {lyrics ? <LyricsViewer content={lyrics.content} /> : <p className="portfolio-muted">Lyrics haven&apos;t been added yet.</p>}
        </div>
        <aside className="lyrics-entry-meta">
          <span className="portfolio-label">TRACK CONTEXT</span>
          <dl>
            <div><dt>Artist</dt><dd>{song.artist_name}</dd></div>
            <div><dt>Release</dt><dd>{song.album?.title ?? 'Single'}</dd></div>
            <div><dt>Track</dt><dd>{song.title}</dd></div>
            <div><dt>View</dt><dd><Link to={`/song/${song.slug}`}>Open track →</Link></dd></div>
          </dl>
        </aside>
      </section>
    </div>
  );
}
