import { useAlbums } from '../../hooks/useCatalog';
import { AlbumCard } from '../../components/albums/AlbumCard';
import { buildWebSiteJsonLd, usePageMeta } from '../../lib/seo';

export function Albums() {
  const albums = useAlbums();

  usePageMeta({
    title: 'ATTIKID Albums',
    description: 'Browse ATTIKID albums and the complete catalog of releases.',
    canonical: 'attikid.vercel.app/music/albums',
    type: 'music.album',
    keywords: ['ATTIKID albums', 'music', 'catalog', 'album releases'],
    image: '/images/hero/hero-music.webp',
    jsonLd: buildWebSiteJsonLd()
  });

  return <div className="page">
    <header className="page-hero page-hero-with-image">
      <div>
        <span className="eyebrow">CATALOG</span>
        <h1>Albums</h1>
        <p>Albums first. Songs forever.</p>
      </div>
      <img src="/images/hero/hero-music.webp" alt="ATTIKID music artwork" />
    </header>

    <section className="content-section">
      <div className="section-heading">
        <span>Release order</span>
        <h2>Release archive</h2>
      </div>
      {albums.loading ? <div className="loading-state">Loading albums…</div> : <div className="album-grid">
        {albums.data.map((album) => <AlbumCard key={album.id} album={album} />)}
      </div>}
    </section>
  </div>;
}
