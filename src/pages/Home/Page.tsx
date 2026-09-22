import { Link } from 'react-router-dom';
import { useFeaturedAlbum, useSongs } from '../../hooks/useCatalog';
import { SongRow } from '../../components/music/SongRow';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { buildWebSiteJsonLd, usePageMeta } from '../../lib/seo';

export function Home(){
  const featured=useFeaturedAlbum();
  const tracks=useSongs(featured.data?.id, 5);
  const ref=useScrollReveal<HTMLElement>();
 usePageMeta({
  title: 'ATTIKID | Official Music, Songs & Lyrics',
  description: 'Listen to ATTIKID music, explore songs and lyrics, and discover the latest tracks from ATTIKID.',
  canonical: 'https://attikid.vercel.app/',
  type: 'website',
  keywords: ['ATTIKID', 'music', 'lyrics', 'artist story', 'albums'],
  image: '/images/hero/hero-home.webp',
  jsonLd: buildWebSiteJsonLd()
});
  return <div className="immersive-home">
    <section className="immersive-hero">
      <img className="immersive-hero__image" src="/images/hero-image.png" alt="ATTIKID in a dim recording room" />
      <div className="immersive-hero__veil"/>
      <div className="immersive-hero__copy">
        <span className="eyebrow">ATTIKID</span>
        <h1>{featured.data?.title ?? 'MY HAPPY ENDING'}</h1>
        <p className="hero-kicker">Attikid - My Happy Ending <span>•</span> OUT NOW</p>
        <div className="button-row"><Link className="button" to={featured.data ? `/music/${featured.data.slug}` : '/music'}>▶&nbsp; Listen now</Link><Link className="button secondary" to="/lyrics">View lyrics</Link></div>
        <p className="hero-microcopy">FOR THE PEOPLE WHO SURVIVED QUIETLY.</p>
      </div>
      <div className="hero-side-note">REAL<br/>MUSIC<br/>FOR<br/>REAL<br/>PEOPLE</div>
      <div className="hero-scroll">SCROLL TO ENTER <span>↓</span></div>
    </section>
    <section ref={ref} className="immersive-section immersive-featured reveal">
      <div className="immersive-section__heading"><span className="eyebrow">01 / FEATURED MUSIC</span><h2>Essential listening</h2><span className="section-rule"/></div>
      {featured.loading ? <div className="loading-state">Loading release…</div> : featured.data ? <div className="release-feature">
        <div className="release-feature__art">{featured.data.cover_url ? <img src={featured.data.cover_url} alt={`${featured.data.title} cover`} /> : <span>ATTIKID</span>}</div>
        <div className="release-feature__info"><span className="mono-label">{new Date(featured.data.release_date).toLocaleDateString()} / ATTIKID MUSIC</span><h3>{featured.data.title}</h3><p>This is where the story continues. Press play and stay awhile.</p><div className="song-list">{tracks.loading ? <div className="loading-state">Loading tracks…</div> : tracks.data.map((s,i)=><SongRow key={s.id} song={s} index={i} songs={tracks.data}/>)}</div><Link className="text-link orange-link" to={`/music/${featured.data.slug}`}>View full release <span>→</span></Link></div>
      </div> : <div className="empty-state">No albums have been released yet.</div>}
    </section>
    <section className="immersive-story"><div><span className="eyebrow">02 / THE ARTIST</span><h2>Music for the things we don't say.</h2></div><p>ATTIKID turns restless nights, hard-won perspective, and the quiet pressure of ordinary life into songs that feel immediate and honest. Each release follows a thread through memory, survival, isolation, hope, and the people who keep showing up. Enter the full story to discover the places and experiences behind the voice.</p><Link to="/about" className="text-link orange-link">Enter the story <span>→</span></Link></section>
  </div>}
