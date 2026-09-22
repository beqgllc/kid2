import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { useFeaturedAlbum, useFeaturedSong, useAlbums, useSongByTitle, useSongs } from '../../hooks/useCatalog';
import { usePlayerStore } from '../../stores/playerStore';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { buildWebSiteJsonLd, usePageMeta } from '../../lib/seo';

const FEATURED_RELEASE_TITLES = [
  'Dead Flowers Still Bloom',
  'Trauma & Shit',
  'Misery Motel',
  'More Trauma & Shit',
];

export function Home() {
  const featured = useFeaturedAlbum();
  const featuredSongQuery = useFeaturedSong();
  const albums = useAlbums();
  const letMeFly = useSongByTitle('Let me fly');
  const tracks = useSongs(featured.data?.id, 5);
  const setPlayer = usePlayerStore((state) => state.set);
  const ref = useScrollReveal<HTMLElement>();

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://www.tiktok.com/embed.js';
    script.async = true;
    document.body.appendChild(script);
    return () => script.remove();
  }, []);

  const playableAlbumTracks = tracks.data.flatMap((song) =>
    song.audio_url ? [{ ...song, audio_url: song.audio_url }] : [],
  );
  const fallbackFeaturedSong = playableAlbumTracks[0] ?? null;
  const featuredSong = featuredSongQuery.data?.audio_url
    ? { ...featuredSongQuery.data, audio_url: featuredSongQuery.data.audio_url }
    : fallbackFeaturedSong;

  const playFeatured = () => {
    if (!featuredSong?.audio_url) return;
    const albumQueue = featuredSong.album_id ? playableAlbumTracks : [featuredSong];
    const currentIndex = Math.max(0, albumQueue.findIndex((song) => song.id === featuredSong.id));

    setPlayer({
      currentSong: featuredSong,
      queue: albumQueue,
      currentIndex,
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
    jsonLd: buildWebSiteJsonLd(),
  });

  return (
    <div className="immersive-home">
      <section className="immersive-hero">
        <img className="immersive-hero__image" src="/images/hero-image.png" alt="ATTIKID in a dim recording room" />
        <div className="immersive-hero__veil" />
        <div className="immersive-hero__copy">
          <span className="eyebrow">ATTIKID</span>
          <h1>{featuredSong?.title ?? featured.data?.title ?? 'MY HAPPY ENDING'}</h1>
          <p className="hero-kicker">THE NEW SINGLE <span>•</span> OUT NOW</p>
          <div className="button-row">
            <button className="button" type="button" onClick={playFeatured} disabled={!featuredSong?.audio_url}>
              ▶&nbsp; Listen now
            </button>
            <Link className="button secondary" to="/lyrics">View lyrics</Link>
          </div>
          <p className="hero-microcopy">FOR THE PEOPLE WHO SURVIVED QUIETLY.</p>
        </div>
        <div className="hero-side-note">REAL<br />MUSIC<br />FOR<br />REAL<br />PEOPLE</div>
        <div className="hero-scroll">SCROLL TO ENTER <span>↓</span></div>
      </section>

      <section ref={ref} className="immersive-section immersive-featured reveal">
        <div className="immersive-section__heading">
          <span className="eyebrow">01 / FEATURED LYRIC VIDEO</span>
          <h2>Official lyric video</h2>
          <span className="section-rule" />
        </div>

        <article className="featured-lyric-video-card">
          <div className="featured-lyric-video-card__title">
            <span className="mono-label">ATTIKID / CLOUDY WITH A CHANCE</span>
            <h3>Let me fly</h3>
          </div>

          <div className="featured-lyric-video-card__embed" aria-label="Let me fly official lyric video">
            <blockquote
              className="tiktok-embed"
              cite="https://www.tiktok.com/@iamattikid/video/7686115895256665357"
              data-video-id="7686115895256665357"
              style={{ maxWidth: '605px', minWidth: '325px' }}
            >
              <section>
                <a target="_blank" title="@iamattikid" href="https://www.tiktok.com/@iamattikid?refer=embed" rel="noreferrer">
                  @iamattikid
                </a>
                <p>
                  They called it giving up. I called it finally letting go. 🖤 “LET ME FLY&quot; For the ones who got tired of pretending they were okay. #LetMeFly #EmoRap #SadRap #EmoRapMusic #RapTok #DarkMusic #UndergroundMusic #NewMusic #LyricVideo #Attikid #FYP #ForYou
                </p>
                <a target="_blank" title="♬ original sound - Attikid" href="https://www.tiktok.com/music/original-sound-Attikid-7686115966803774221?refer=embed" rel="noreferrer">
                  ♬ original sound - Attikid
                </a>
              </section>
            </blockquote>
          </div>

          <div className="featured-lyric-video-card__actions">
            <Link className="button" to={letMeFly.data ? "/lyrics/" + letMeFly.data.slug : "/lyrics"}>
              Read Let me fly lyrics
            </Link>
            <Link className="button secondary" to="/music/cloudy-with-a-chance">
              Cloudy With A Chance
            </Link>
          </div>
        </article>
      </section>

      <section className="immersive-story">
        <div>
          <span className="eyebrow">02 / THE ARTIST</span>
          <h2>Music for the things we don't say.</h2>
        </div>
        <p>
          ATTIKID turns restless nights, hard-won perspective, and the quiet pressure of ordinary life into songs that feel immediate and honest. Each release follows a thread through memory, survival, isolation, hope, and the people who keep showing up. Enter the full story to discover the places and experiences behind the voice.
        </p>
        <Link to="/about" className="text-link orange-link">Enter the story <span>→</span></Link>
      </section>

      <section className="immersive-upcoming">
        <div className="immersive-section__heading">
          <span className="eyebrow">03 / UPCOMING RELEASES</span>
          <h2>Next signal.</h2>
          <span className="section-rule" />
        </div>
        <article className="upcoming-release-card">
          <div>
            <span className="mono-label">EXPECTED RELEASE / DECEMBER 2026</span>
            <h3>Cloudy With A Chance</h3>
          </div>
          <span className="upcoming-release-card__date">12 / 2026</span>
        </article>
      </section>
    </div>
  );
}
