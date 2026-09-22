import { Link } from 'react-router-dom';
import { useFeaturedAlbum, useAlbums, useSongs } from '../../hooks/useCatalog';
import { usePlayerStore } from '../../stores/playerStore';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { buildWebSiteJsonLd, usePageMeta } from '../../lib/seo';

const FEATURED_RELEASE_TITLES = [
  'Dead Flowers Still Bloom',
  'Trauma & Shit',
  'Misery Motel',
  'More Trauma & Shit',
];

export function Home(){
  const featured = useFeaturedAlbum();
  const albums = useAlbums();
  const tracks = useSongs(featured.data?.id, 5);
  const setPlayer = usePlayerStore((state) => state.set);
  const ref = useScrollReveal<HTMLElement>();

  const playableFeaturedTracks = tracks.data.filter((song) => Boolean(song.audio_url)) as Array<typeof tracks.data[number] & { audio_url: string }>;
  const featuredSong = playableFeaturedTracks[0] ?? null;

  const playFeatured = () => {
    if (!featuredSong) return;
    setPlayer({
      currentSong: featuredSong,
      queue: playableFeaturedTracks,
      currentIndex: 0,
      isPlaying: true,
      status: 'loading',
      currentTime: 0,
      error: null,
    });
  };

  const featuredReleases = FEATURED_RELEASE_TITLES.map((title) => ({
    title,
    album: albums.data.find((album) => album.title.trim().toLowerCase() === title.toLowerCase()),
  }));

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
        <p className="hero-kicker">THE NEW SINGLE <span>•</span> OUT NOW</p>
        <div className="button-row">
          <button className="button" type="button" onClick={playFeatured} disabled={!featuredSong}>
            ▶&nbsp; Listen now
          </button>
          <Link className="button secondary" to="/lyrics">View lyrics</Link>
        </div>
        <p className="hero-microcopy">FOR THE PEOPLE WHO SURVIVED QUIETLY.</p>
      </div>
      <div className="hero-side-note">REAL<br/>MUSIC<br/>FOR<br/>REAL<br/>PEOPLE</div>
      <div className="hero-scroll">SCROLL TO ENTER <span>↓</span></div>
    </section>

    <section ref={ref} className="immersive-section immersive-featured reveal">
      <div className="immersive-section__heading">
        <span className="eyebrow">01 / FEATURED MUSIC</span>
        <h2>Essential listening</h2>
        <span className="section-rule"/>
      </div>

      <div className="featured-release-grid">
        {featuredReleases.map(({ title, album }) => (
          <article className="featured-release-card" key={title}>
            <div className="featured-release-card__art">
              {album?.cover_url ? <img src={album.cover_url} alt={`${title} cover`} /> : <span>ATTIKID</span>}
            </div>
            <div className="featured-release-card__meta">
              <span className="mono-label">{album ? new Date(album.release_date).toLocaleDateString() : 'RELEASE METADATA PENDING'}</span>
              <h3>{title}</h3>
              {album?.artist_name && <p>{album.artist_name}</p>}
              {album ? (
                <Link className="text-link orange-link" to={`/music/${album.slug}`}>View release <span>→</span></Link>
              ) : (
                <span className="mono-label">DROP THE RELEASE FOLDER TO SYNC</span>
              )}
            </div>
          </article>
        ))}
      </div>

    </section>

    <section className="immersive-story">
      <div><span className="eyebrow">02 / THE ARTIST</span><h2>Music for the things we don't say.</h2></div>
      <p>ATTIKID turns restless nights, hard-won perspective, and the quiet pressure of ordinary life into songs that feel immediate and honest. Each release follows a thread through memory, survival, isolation, hope, and the people who keep showing up. Enter the full story to discover the places and experiences behind the voice.</p>
      <Link to="/about" className="text-link orange-link">Enter the story <span>→</span></Link>
    </section>

    <section className="immersive-upcoming">
      <div className="immersive-section__heading">
        <span className="eyebrow">03 / UPCOMING RELEASES</span>
        <h2>Next signal.</h2>
        <span className="section-rule"/>
      </div>
      <article className="upcoming-release-card">
        <div>
          <span className="mono-label">EXPECTED RELEASE / DECEMBER 2026</span>
          <h3>Cloudy with a chance</h3>
        </div>
        <span className="upcoming-release-card__date">12 / 2026</span>
      </article>
    </section>
  </div>
}
