import { describe, expect, it } from 'vitest';
import {
  buildAlbumJsonLd,
  buildHomeJsonLd,
  buildSongJsonLd,
  buildWebSiteJsonLd,
  getCanonicalUrl,
  siteUrl,
} from '../../src/lib/seo';

describe('SEO metadata and JSON-LD builders', () => {
  it('uses attikid.com as the production canonical host', () => {
    expect(siteUrl).toBe('https://attikid.com');
    expect(getCanonicalUrl('https://attikid.vercel.app/music/albums')).toBe(
      'https://attikid.com/music/albums',
    );
    expect(getCanonicalUrl('/')).toBe('https://attikid.com/');
  });

  it('builds homepage Website and Person schema in a single graph', () => {
    const jsonLd = buildHomeJsonLd();
    expect(jsonLd['@graph']).toHaveLength(2);
    expect(jsonLd['@graph'][0]['@type']).toBe('WebSite');
    expect(jsonLd['@graph'][1]['@type']).toBe('Person');
    const person = jsonLd['@graph'][1] as Record<string, unknown>;
    expect(person.sameAs).toContain('https://www.tiktok.com/@iamattikid');
  });

  it('builds a website JSON-LD object with a stable identity', () => {
    const jsonLd = buildWebSiteJsonLd();
    expect(jsonLd['@type']).toBe('WebSite');
    expect(jsonLd['@id']).toBe('https://attikid.com/#website');
    expect(jsonLd.name).toBe('ATTIKID');
    expect(jsonLd.url).toBe('https://attikid.com/');
    expect(jsonLd).not.toHaveProperty('potentialAction');
  });

  it('builds an album JSON-LD object', () => {
    const jsonLd = buildAlbumJsonLd({
      title: 'Signals in the Walls',
      description: 'A record about staying human.',
      artist_name: 'ATTIKID',
      release_date: '2026-09-09',
      slug: 'signals-in-the-walls',
      cover_url: 'https://attikid.com/images/album.jpg',
    });

    expect(jsonLd['@type']).toBe('MusicAlbum');
    expect(jsonLd.name).toBe('Signals in the Walls');
    expect(jsonLd.url).toBe('https://attikid.com/music/signals-in-the-walls');
  });

  it('builds a song JSON-LD object', () => {
    const jsonLd = buildSongJsonLd({
      title: 'Static Heart',
      artist_name: 'ATTIKID',
      album: { title: 'Signals in the Walls' },
      release_date: '2026-09-09',
      slug: 'static-heart',
      artwork_url: 'https://attikid.com/images/album.jpg',
      audio_url: 'https://attikid.com/audio/static-heart.mp3',
    });

    expect(jsonLd['@type']).toBe('MusicRecording');
    expect(jsonLd.name).toBe('Static Heart');
    expect(jsonLd.audio?.['@type']).toBe('AudioObject');
  });
});
