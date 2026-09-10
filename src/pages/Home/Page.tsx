import { useState } from 'react';
import { buildWebSiteJsonLd, usePageMeta } from '../../lib/seo';

export function Home(){
  const [musicOpen, setMusicOpen] = useState(false);

  usePageMeta({
    title: 'ATTIKID | Official Music, Songs & Lyrics',
    description: 'Listen to ATTIKID music, explore songs and lyrics, and discover the latest tracks from ATTIKID.',
    canonical: 'https://attikid.vercel.app/',
    type: 'website',
    keywords: ['ATTIKID', 'music', 'lyrics', 'artist story', 'albums'],
    image: '/images/hero/hero-home.webp',
    jsonLd: buildWebSiteJsonLd()
  });

  return <div className="attikid-homepage">
    <section className="attikid-home-hero">
      <div className="attikid-home-hero-bg" aria-label="ATTIKID hero background" role="img" />

      <a className="attikid-home-brand" href="#home" aria-label="ATTIKID Music home">
        <img src="/images/brand/logo.webp" alt="ATTIKID Music" className="attikid-home-logo" />
      </a>

      <div className="attikid-home-nav-shell" aria-label="Primary navigation">
        <div className="attikid-home-nav-platform" aria-hidden="true" />
        <nav className="attikid-home-nav" aria-label="Main site navigation">
          <a className="attikid-home-nav-hit attikid-home-nav-home" href="#home"><span>Home</span></a>
          <a className="attikid-home-nav-hit attikid-home-nav-supply" href="#supply"><span>Supply</span></a>

          <div className={`attikid-home-nav-item attikid-home-nav-music-item ${musicOpen ? 'is-open' : ''}`}>
            <button
              type="button"
              className="attikid-home-nav-hit attikid-home-nav-music"
              aria-expanded={musicOpen}
              aria-controls="music-submenu"
              onClick={() => setMusicOpen(!musicOpen)}
            >
              <span>Music</span>
            </button>

            <div id="music-submenu" className="attikid-home-dropdown" aria-label="Music submenu">
              <a href="#music" onClick={() => setMusicOpen(false)}>Albums</a>
              <a href="#lyrics" onClick={() => setMusicOpen(false)}>Lyrics</a>
              <a href="#music" onClick={() => setMusicOpen(false)}>Videos</a>
            </div>
          </div>

          <a className="attikid-home-nav-hit attikid-home-nav-story" href="#story"><span>Story</span></a>
        </nav>

        <a className="attikid-home-signin" href="/admin/login">Sign In</a>
      </div>

      <div className="attikid-home-landing">
        <div className="attikid-home-hero-actions" id="music">
          <a className="stream-button" href="#music" aria-label="Stream or download new music">Listen now</a>
          <div className="attikid-home-social-row" aria-label="Social links">
            <a href="https://x.com/Attikid_" aria-label="X" className="attikid-home-social x">X</a>
            <a href="https://www.tiktok.com/@iamattikid" aria-label="TikTok" className="attikid-home-social tiktok">♪</a>
            <a href="https://soundcloud.com/attikid" aria-label="SoundCloud" className="attikid-home-social soundcloud">≋</a>
          </div>
        </div>

        <a className="attikid-home-scroll" href="#latest" aria-label="Scroll to latest content">
          <span>Latest</span>
          <i aria-hidden="true" />
        </a>
      </div>
    </section>

    <section className="attikid-home-latest" id="latest">
      <div className="attikid-home-latest-inner">
        <div className="attikid-home-latest-heading">
          <span className="attikid-home-kicker">Latest</span>
        </div>

        <div className="attikid-home-product-grid">
          <article className="attikid-home-product-card">
            <a className="attikid-home-product-media" href="#music" aria-label="Open Misery Motel">
              <img src="/images/artwork/miserymotel.png" alt="Misery Motel artwork" />
            </a>
            <div className="attikid-home-product-meta">
              <h2>Misery Motel</h2>
              <h2>Attikid</h2>
            </div>
          </article>

          <article className="attikid-home-product-card attikid-home-product-card-supply" id="supply">
            <a className="attikid-home-product-media" href="#supply" aria-label="Open Camo Hoodie product">
              <img src="/images/shop/camo.png" alt="Camo Hoodie" />
            </a>
            <div className="attikid-home-product-meta">
              <h2>Camo Hoodie</h2>
              <h2>$45.00</h2>
            </div>
          </article>

          <article className="attikid-home-product-card">
            <a className="attikid-home-product-media" href="#story" aria-label="Open Kid Signed Poster product">
              <img src="/images/artwork/poster.png" alt="Kid Signed Poster" />
            </a>
            <div className="attikid-home-product-meta">
              <h2>Kid Poster</h2>
              <h2>$25.00</h2>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section id="lyrics" className="sr-only-section" aria-label="Lyrics" />
    <section id="story" className="sr-only-section" aria-label="Story" />
    <section id="newsletter" className="sr-only-section" aria-label="Newsletter" />
  </div>;
}

