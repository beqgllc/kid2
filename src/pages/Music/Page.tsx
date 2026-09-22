import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAlbums, useSongs } from '../../hooks/useCatalog';
import { AlbumCard } from '../../components/albums/AlbumCard';
import { buildWebSiteJsonLd, usePageMeta } from '../../lib/seo';

export function Music(){
  const albums = useAlbums();
  const songs = useSongs();
  const allSongs = songs.data;

  const tracksByAlbum = useMemo(
    () => allSongs.reduce<Record<string, typeof allSongs>>((groups, song) => {
      if (!song.album_id) return groups;
      (groups[song.album_id] ??= []).push(song);
      return groups;
    }, {}),
    [allSongs],
  );

  usePageMeta({
    title: 'ATTIKID Albums',
    description: 'Browse ATTIKID album releases, artwork, purposes, track lists, and credits.',
    canonical: 'https://attikid.vercel.app/music/albums',
    type: 'music',
    keywords: ['ATTIKID music', 'albums', 'records', 'catalog'],
    image: '/images/hero/hero-music.webp',
    jsonLd: buildWebSiteJsonLd()
  });

  return (
    <div className="page music-catalog-page">
      <header className="page-hero page-hero-with-image">
        <div>
          <span className="eyebrow">CATALOG / ALBUMS</span>
          <h1>Albums</h1>
          <p>Every ATTIKID album, with the story and metadata behind the tracks.</p>
          <div className="music-page-links">
            <Link to="/music/a-z">A-Z</Link>
            <Link className="active" to="/music/albums">Albums</Link>
            <Link to="/music/singles">Singles</Link>
          </div>
        </div>
        <img src="/images/hero/hero-music.webp" alt="ATTIKID music artwork" />
      </header>

      <section className="content-section">
        <div className="section-heading">
          <span>Release catalog</span>
          <h2>Albums</h2>
        </div>
        {albums.loading || songs.loading ? (
          <div className="loading-state">Loading album catalog…</div>
        ) : albums.data.length ? (
          <div className="album-catalog-grid">
            {albums.data.map((album) => (
              <AlbumCard key={album.id} album={album} tracks={tracksByAlbum[album.id] ?? []}/>
            ))}
          </div>
        ) : (
          <div className="empty-state">No album releases have been ingested yet.</div>
        )}
      </section>
    </div>
  );
}
