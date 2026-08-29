import { requireSupabase } from '../lib/supabase/client';
import type { Album, Song } from '../types/models';

function storageUrl(bucket: string, path: string | null) {
  if (!path) return null;
  const client = requireSupabase();
  const { data } = client.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function getAlbums(limit?: number): Promise<Album[]> {
  const supabase = requireSupabase();
  let query = supabase.from('albums').select('*').order('release_date', { ascending: false });
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map((a) => ({ ...a, cover_url: storageUrl('attikid-artwork', a.cover_art_path) }));
}

export async function getFeaturedAlbum() {
  const supabase = requireSupabase();
  const { data, error } = await supabase.from('albums').select('*').eq('is_featured', true).order('release_date', { ascending: false }).limit(1).maybeSingle();
  if (error) throw error;
  return data ? { ...data, cover_url: storageUrl('attikid-artwork', data.cover_art_path) } : null;
}

export async function getAlbumBySlug(slug: string): Promise<Album | null> {
  const supabase = requireSupabase();
  const { data, error } = await supabase.from('albums').select('*').eq('slug', slug).maybeSingle();
  if (error) throw error;
  return data ? { ...data, cover_url: storageUrl('attikid-artwork', data.cover_art_path) } : null;
}

export async function getSongs(options?: { albumId?: string; limit?: number }) : Promise<Song[]> {
  const supabase = requireSupabase();
  let query = supabase.from('songs').select('*, albums(*)').order('track_number', { ascending: true, nullsFirst: false }).order('title');
  if (options?.albumId) query = query.eq('album_id', options.albumId);
  if (options?.limit) query = query.limit(options.limit);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    ...row,
    album: row.albums ?? null,
    artwork_url: storageUrl('attikid-artwork', row.albums?.cover_art_path ?? null),
    audio_url: storageUrl('attikid-audio', row.audio_path),
  }));
}

export async function getLatestSongs(limit = 6) {
  const supabase = requireSupabase();
  const { data, error } = await supabase.from('songs').select('*, albums(*)').order('release_date', { ascending: false, nullsFirst: false }).order('created_at', { ascending: false }).limit(limit);
  if (error) throw error;
  return (data ?? []).map((row: any) => ({ ...row, album: row.albums ?? null, artwork_url: storageUrl('attikid-artwork', row.albums?.cover_art_path ?? null), audio_url: storageUrl('attikid-audio', row.audio_path) }));
}

export async function getSongBySlug(slug: string): Promise<Song | null> {
  const supabase = requireSupabase();
  const { data, error } = await supabase.from('songs').select('*, albums(*)').eq('slug', slug).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return { ...(data as any), album: (data as any).albums ?? null, artwork_url: storageUrl('attikid-artwork', (data as any).albums?.cover_art_path ?? null), audio_url: storageUrl('attikid-audio', (data as any).audio_path) };
}
