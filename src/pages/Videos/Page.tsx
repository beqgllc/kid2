import { buildWebSiteJsonLd, usePageMeta } from '../../lib/seo';

export function Videos() {
  usePageMeta({
    title: 'ATTIKID Videos',
    description: 'Watch ATTIKID videos and visual releases.',
    canonical: 'attikid.vercel.app/music/videos',
    type: 'website',
    keywords: ['ATTIKID', 'videos', 'music video'],
    image: '/images/hero/hero-home.webp',
    jsonLd: buildWebSiteJsonLd()
  });

  return <div className="page">
    <header className="page-hero page-hero-with-image">
      <div>
        <span className="eyebrow">ATTIKID</span>
        <h1>Videos</h1>
        <p>Visuals for the work in motion.</p>
      </div>
      <img src="/images/hero/hero-home.webp" alt="ATTIKID visual artwork" />
    </header>

    <section className="content-section">
      <div className="section-heading">
        <span>Video archive</span>
        <h2>Official videos</h2>
      </div>
      <div className="video-grid">
        <article className="video-card">
          <iframe
            src="https://www.youtube.com/embed/dQw4w9WgXcQ"
            title="ATTIKID video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
          <div className="video-meta">
            <strong>ATTIKID — Live Room</strong>
            <span>Official visual</span>
          </div>
        </article>
        <article className="video-card">
          <iframe
            src="https://www.youtube.com/embed/ysz5S6PUM-U"
            title="ATTIKID video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
          <div className="video-meta">
            <strong>ATTIKID — Visual Study</strong>
            <span>Field cut</span>
          </div>
        </article>
      </div>
    </section>
  </div>;
}
