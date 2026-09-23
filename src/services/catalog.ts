import { requireSupabase } from '../lib/supabase/client';
import { fallbackMediaUrl, mediaUrl } from './mediaUrls';
import type { Album, Song } from '../types/models';

function mapAlbum(row: any): Album {
  return {
    ...row,
    metadata: row.metadata ?? {},
    cover_url: mediaUrl('attikid-artwork', row.cover_art_path),
  };
}

export async function getAlbums(limit?: number): Promise<Album[]> {
  const supabase = requireSupabase();
  let query = supabase.from('albums').select('*').order('release_date', { ascending: false });
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(mapAlbum);
}

export async function getFeaturedAlbum() {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('albums')
    .select('*')
    .eq('is_featured', true)
    .order('release_date', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ? mapAlbum(data) : null;
}

export async function getLatestAlbum() {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('albums')
    .select('*')
    .order('release_date', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ? mapAlbum(data) : null;
}

export async function getAlbumBySlug(slug: string): Promise<Album | null> {
  const supabase = requireSupabase();
  const { data, error } = await supabase.from('albums').select('*').eq('slug', slug).maybeSingle();
  if (error) throw error;
  return data ? mapAlbum(data) : null;
}

function normalizeSongTitle(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function dedupeSongs(songs: Song[]) {
  const newestByTitle = new Map<string, Song>();

  for (const song of songs) {
    const key = normalizeSongTitle(song.title);
    const existing = newestByTitle.get(key);
    if (!existing || new Date(song.created_at).getTime() > new Date(existing.created_at).getTime()) {
      newestByTitle.set(key, song);
    }
  }

  return songs.filter((song) => newestByTitle.get(normalizeSongTitle(song.title))?.id === song.id);
}

function mapSong(row: any): Song {
  const album = row.albums ?? null;
  const artworkPath = row.artwork_path ?? album?.cover_art_path ?? null;
  return {
    ...row,
    album,
    metadata: row.metadata ?? {},
    artwork_path: artworkPath,
    artwork_url: mediaUrl('attikid-artwork', artworkPath),
    audio_url: mediaUrl('attikid-audio', row.audio_path),
    audio_fallback_url: fallbackMediaUrl('attikid-audio', row.audio_path),
  };
}

export async function getFeaturedSong(): Promise<Song | null> {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('songs')
    .select('*, albums(*)')
    .eq('is_featured', true)
    .order('release_date', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ? mapSong(data) : null;
}

export async function getSongByTitle(title: string): Promise<Song | null> {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('songs')
    .select('*, albums(*)')
    .ilike('title', title)
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ? mapSong(data) : null;
}

export async function getSongs(options?: { albumId?: string; limit?: number }): Promise<Song[]> {
  const supabase = requireSupabase();
  let query = supabase
    .from('songs')
    .select('*, albums(*)')
    .order('track_number', { ascending: true, nullsFirst: false })
    .order('title');
  if (options?.albumId) query = query.eq('album_id', options.albumId);
  if (options?.limit) query = query.limit(options.limit);
  const { data, error } = await query;
  if (error) throw error;
  return dedupeSongs((data ?? []).map(mapSong));
}

export async function getLatestSongs(limit = 6) {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('songs')
    .select('*, albums(*)')
    .order('release_date', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return dedupeSongs((data ?? []).map(mapSong));
}

export async function getSongBySlug(slug: string): Promise<Song | null> {
  const supabase = requireSupabase();
  const { data, error } = await supabase.from('songs').select('*, albums(*)').eq('slug', slug).maybeSingle();
  if (error) throw error;
  return data ? mapSong(data) : null;
}
