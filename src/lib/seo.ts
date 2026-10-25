import { useEffect } from 'react';

export type SeoJsonLd = Record<string, unknown> | Record<string, unknown>[];

export interface SeoMeta {
  title: string;
  description: string;
  canonical: string;
  image?: string;
  type?:
    | 'website'
    | 'article'
    | 'music.album'
    | 'music.song'
    | 'music.playlist'
    | 'profile'
    | 'music';
  keywords?: string[];
  jsonLd?: SeoJsonLd;
}

const PRODUCTION_SITE_URL = 'https://attikid.com';

function normalizeSiteUrl(value?: string) {
  if (!value?.trim()) return PRODUCTION_SITE_URL;

  try {
    const parsed = new URL(value.trim());
    // The legacy Vercel URL must not become the canonical host for the custom domain.
    if (parsed.hostname.toLowerCase() === 'attikid.vercel.app') {
      return PRODUCTION_SITE_URL;
    }
    return parsed.origin;
  } catch {
    return PRODUCTION_SITE_URL;
  }
}

export const siteUrl = normalizeSiteUrl(import.meta.env.VITE_SITE_URL);

const normalizePath = (path: string) => (path.startsWith('/') ? path : '/' + path);

/** Return a same-site canonical URL, even when a caller still passes the legacy Vercel URL. */
export function getCanonicalUrl(value: string) {
  try {
    const parsed = new URL(value, siteUrl + '/');
    const path = parsed.pathname === '/' ? '/' : parsed.pathname.replace(/\/+$/, '');
    return siteUrl + path;
  } catch {
    return siteUrl + normalizePath(value).replace(/\/+$/, '');
  }
}

const absoluteUrl = (value: string) => {
  if (/^https?:\/\//i.test(value)) {
    try {
      const parsed = new URL(value);
      if (parsed.hostname.toLowerCase() === 'attikid.vercel.app') {
        return siteUrl + (parsed.pathname === '/' ? '/' : parsed.pathname);
      }
      return parsed.toString();
    } catch {
      return siteUrl + normalizePath(value);
    }
  }

  return siteUrl + normalizePath(value);
};

export function usePageMeta(meta: SeoMeta) {
  useEffect(() => {
    const canonical = getCanonicalUrl(meta.canonical);
    const image = absoluteUrl(meta.image ?? '/images/artist/artist-press-photo-1.webp');

    document.title = meta.title;

    const setMeta = (
      selector: string,
      attr: 'name' | 'property',
      value: string,
      content: string,
    ) => {
      let tag = document.querySelector(
        selector + '[' + attr + '="' + value + '"]',
      ) as HTMLMetaElement | null;

      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attr, value);
        document.head.appendChild(tag);
      }

      tag.setAttribute('content', content);
    };

    setMeta('meta', 'name', 'description', meta.description);
    setMeta('meta', 'name', 'author', 'ATTIKID');
    setMeta(
      'meta',
      'name',
      'robots',
      'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    );
    setMeta('meta', 'property', 'og:title', meta.title);
    setMeta('meta', 'property', 'og:description', meta.description);
    setMeta('meta', 'property', 'og:type', meta.type ?? 'website');
    setMeta('meta', 'property', 'og:url', canonical);
    setMeta('meta', 'property', 'og:site_name', 'ATTIKID');
    setMeta('meta', 'property', 'og:locale', 'en_US');
    setMeta('meta', 'property', 'og:image', image);
    setMeta('meta', 'property', 'og:image:alt', meta.title + ' — ATTIKID');
    setMeta('meta', 'name', 'twitter:card', 'summary_large_image');
    setMeta('meta', 'name', 'twitter:title', meta.title);
    setMeta('meta', 'name', 'twitter:description', meta.description);
    setMeta('meta', 'name', 'twitter:image', image);
    setMeta('meta', 'name', 'twitter:image:alt', meta.title + ' — ATTIKID');

    if (meta.keywords?.length) {
      setMeta('meta', 'name', 'keywords', meta.keywords.join(', '));
    }

    let canonicalTag = document.querySelector(
      'link[rel="canonical"]',
    ) as HTMLLinkElement | null;

    if (!canonicalTag) {
      canonicalTag = document.createElement('link');
      canonicalTag.rel = 'canonical';
      document.head.appendChild(canonicalTag);
    }

    canonicalTag.href = canonical;

    const jsonLdScript = document.querySelector(
      '#attikid-seo-json-ld',
    ) as HTMLScriptElement | null;

    if (jsonLdScript) jsonLdScript.remove();

    if (meta.jsonLd) {
      const script = document.createElement('script');
      script.id = 'attikid-seo-json-ld';
      script.type = 'application/ld+json';
      script.text = JSON.stringify(meta.jsonLd);
      document.head.appendChild(script);
    }
  }, [meta]);
}

export function buildWebSiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': siteUrl + '/#website',
    name: 'ATTIKID',
    url: siteUrl + '/',
    description: 'The official ATTIKID artist archive for original music, albums, songs, lyrics, music videos, and artist story.',
    inLanguage: 'en-US',
    publisher: { '@id': siteUrl + '/#artist' },
  };
}

export function buildAlbumJsonLd(album: {
  title: string;
  description?: string | null;
  artist_name: string;
  release_date: string;
  slug: string;
  cover_url?: string | null;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'MusicAlbum',
    '@id': siteUrl + '/music/' + album.slug + '#album',
    name: album.title,
    byArtist: {
      '@type': 'MusicGroup',
      name: album.artist_name,
    },
    datePublished: album.release_date,
    description: album.description ?? undefined,
    image: absoluteUrl(album.cover_url ?? '/images/artist/artist-press-photo-1.webp'),
    url: siteUrl + '/music/' + album.slug,
  };
}

export function buildSongJsonLd(song: {
  title: string;
  artist_name: string;
  album?: { title?: string | null } | null;
  release_date?: string | null;
  slug: string;
  artwork_url?: string | null;
  audio_url?: string | null;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'MusicRecording',
    '@id': siteUrl + '/song/' + song.slug + '#recording',
    name: song.title,
    byArtist: {
      '@type': 'MusicGroup',
      name: song.artist_name,
    },
    inAlbum: song.album?.title
      ? { '@type': 'MusicAlbum', name: song.album.title }
      : undefined,
    datePublished: song.release_date ?? undefined,
    image: absoluteUrl(song.artwork_url ?? '/images/artist/artist-press-photo-1.webp'),
    url: siteUrl + '/song/' + song.slug,
    audio: song.audio_url
      ? { '@type': 'AudioObject', contentUrl: song.audio_url }
      : undefined,
  };
}
