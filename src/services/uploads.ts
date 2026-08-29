import { requireSupabase } from '../lib/supabase/client';
import { assertAudio, assertText } from '../lib/validation';
import { slugify } from '../lib/utils';
import type { Album } from '../types/models';
import { getAlbums } from './catalog';

function extension(file: File) {
  return file.name.split('.').pop()?.toLowerCase() || 'bin';
}

export async function ensureAlbum(title: string, artistName: string, releaseDate: string) {
  const supabase = requireSupabase();
  const baseSlug = slugify(title);
  const { data: existing } = await supabase.from('albums').select('*').eq('slug', baseSlug).maybeSingle();
  if (existing) return existing as Album;
  const { data, error } = await supabase.from('albums').insert({ title: assertText(title, 'Album', 1, 200), artist_name: assertText(artistName, 'Artist', 1, 120), release_date: releaseDate, slug: baseSlug }).select().single();
  if (error) throw error;
  return data as Album;
}

export async function uploadSong(input: { file: File; title: string; artistName: string; albumId: string; releaseDate?: string; trackNumber?: number; onProgress?: (n: number) => void }) {
  assertAudio(input.file);
  assertText(input.title, 'Song title', 1, 200);
  const supabase = requireSupabase();
  const songId = crypto.randomUUID();
  const path = `audio/${input.albumId}/${songId}/${songId}.${extension(input.file)}`;
  input.onProgress?.(10);
  const { error: uploadError } = await supabase.storage.from('attikid-audio').upload(path, input.file, { contentType: input.file.type || 'application/octet-stream', upsert: false });
  if (uploadError) throw uploadError;
  input.onProgress?.(75);
  const titleSlug = slugify(input.title);
  const { data: collision } = await supabase.from('songs').select('id').eq('slug', titleSlug).maybeSingle();
  const finalSlug = collision ? `${titleSlug}-${songId.slice(0, 8)}` : titleSlug;
  const { data, error } = await supabase.from('songs').insert({ id: songId, album_id: input.albumId, title: input.title.trim(), artist_name: input.artistName.trim(), track_number: input.trackNumber ?? null, slug: finalSlug, audio_path: path, audio_mime_type: input.file.type || null, file_size: input.file.size, release_date: input.releaseDate || null }).select().single();
  if (error) {
    await supabase.storage.from('attikid-audio').remove([path]);
    throw error;
  }
  input.onProgress?.(100);
  return data;
}

export async function deleteSong(song: any) {
  const supabase = requireSupabase();
  const { error: storageError } = await supabase.storage.from('attikid-audio').remove([song.audio_path]);
  if (storageError) throw storageError;
  const { error } = await supabase.from('songs').delete().eq('id', song.id);
  if (error) throw error;
}

export async function updateSong(songId: string, patch: Record<string, unknown>) {
  const supabase = requireSupabase();
  const { data, error } = await supabase.from('songs').update(patch).eq('id', songId).select().single();
  if (error) throw error;
  return data;
}

export async function updateAlbum(albumId: string, patch: Record<string, unknown>) {
  const supabase = requireSupabase();
  const { data, error } = await supabase.from('albums').update(patch).eq('id', albumId).select().single();
  if (error) throw error;
  return data;
}

export async function deleteAlbum(albumId: string) {
  const supabase = requireSupabase();
  const songs = await supabase.from('songs').select('id,audio_path').eq('album_id', albumId);
  if (songs.error) throw songs.error;
  if (songs.data?.length) {
    const paths = songs.data.map((s) => s.audio_path);
    const { error } = await supabase.storage.from('attikid-audio').remove(paths);
    if (error) throw error;
  }
  const { error: songDeleteError } = await supabase.from('songs').delete().eq('album_id', albumId);
  if (songDeleteError) throw songDeleteError;
  const { error } = await supabase.from('albums').delete().eq('id', albumId);
  if (error) throw error;
  return getAlbums();
}
