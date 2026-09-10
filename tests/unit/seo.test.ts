import { describe, expect, it } from 'vitest';
import { buildAlbumJsonLd, buildSongJsonLd, buildWebSiteJsonLd } from '../../src/lib/seo';

describe('seo json-ld builders', () => {
  it('builds a website json-ld object', () => {
    const jsonLd = buildWebSiteJsonLd();
    expect(jsonLd['@type']).toBe('WebSite');
    expect(jsonLd.name).toBe('ATTIKID');
  });

  it('builds an album json-ld object', () => {
    const jsonLd = buildAlbumJsonLd({
      title: 'Signals in the Walls',
      description: 'A record about staying human.',
      artist_name: 'ATTIKID',
      release_date: '2026-09-09',
      slug: 'signals-in-the-walls',
      cover_url: 'https://attikid.vercel.app/images/album.jpg'
    });

    expect(jsonLd['@type']).toBe('MusicAlbum');
    expect(jsonLd.name).toBe('Signals in the Walls');
    expect(jsonLd.url).toContain('/music/signals-in-the-walls');
  });

  it('builds a song json-ld object', () => {
    const jsonLd = buildSongJsonLd({
      title: 'Static Heart',
      artist_name: 'ATTIKID',
      album: { title: 'Signals in the Walls' },
      release_date: '2026-09-09',
      slug: 'static-heart',
      artwork_url: 'https://attikid.vercel.app/images/album.jpg',
      audio_url: 'https://attikid.vercel.app/audio/static-heart.mp3'
    });

    expect(jsonLd['@type']).toBe('MusicRecording');
    expect(jsonLd.name).toBe('Static Heart');
    expect(jsonLd.audio['@type']).toBe('AudioObject');
  });
});
