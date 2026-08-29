import { requireSupabase } from '../lib/supabase/client';
import { assertAudio, assertText } from '../lib/validation';
import { slugify } from '../lib/utils';
import type { Album } from '../types/models';
import { getAlbums } from './catalog';

function extension(file: File) {
  return file.name.split('.').pop()?.toLowerCase() || 'bin';
}

function audioContentType(file: File) {
  if (file.type) return file.type;
  const types: Record<string, string> = { mp3: 'audio/mpeg', wav: 'audio/wav', ogg: 'audio/ogg', m4a: 'audio/mp4' };
  return types[extension(file)] || 'application/octet-stream';
}

function imageContentType(file: File) {
  const types: Record<string, string> = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };
  return types[extension(file)] || (['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ? file.type : null);
}

function getAudioDuration(file: File) {
  return new Promise<number>((resolve) => {
    const audio = document.createElement('audio');
    const url = URL.createObjectURL(file);
    const cleanup = () => {
      URL.revokeObjectURL(url);
      audio.remove();
    };
    audio.preload = 'metadata';
    audio.onloadedmetadata = () => {
      const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
      cleanup();
      resolve(duration);
    };
    audio.onerror = () => {
      cleanup();
      resolve(0);
    };
    audio.src = url;
  });
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
  const durationSeconds = await getAudioDuration(input.file);
  input.onProgress?.(10);
  const contentType = audioContentType(input.file);
  const { error: uploadError } = await supabase.storage.from('attikid-audio').upload(path, input.file, { contentType, upsert: false });
  if (uploadError) throw uploadError;
  input.onProgress?.(75);
  const titleSlug = slugify(input.title);
  const { data: collision } = await supabase.from('songs').select('id').eq('slug', titleSlug).maybeSingle();
  const finalSlug = collision ? `${titleSlug}-${songId.slice(0, 8)}` : titleSlug;
  const { data, error } = await supabase.from('songs').insert({ id: songId, album_id: input.albumId, title: input.title.trim(), artist_name: input.artistName.trim(), track_number: input.trackNumber ?? null, slug: finalSlug, audio_path: path, audio_mime_type: contentType, file_size: input.file.size, duration_seconds: durationSeconds || null, release_date: input.releaseDate || null }).select().single();
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

export async function uploadAlbumArtwork(albumId: string, file: File) {
  const contentType = imageContentType(file);
  if (!contentType) throw new Error('Choose a JPG, PNG, or WebP image.');
  if (file.size <= 0) throw new Error('The cover art file is empty.');
  if (file.size > 10 * 1024 * 1024) throw new Error('Cover art must be 10 MB or smaller.');
  const supabase = requireSupabase();
  const path = `albums/${albumId}/${crypto.randomUUID()}.${extension(file)}`;
  const { error: uploadError } = await supabase.storage.from('attikid-artwork').upload(path, file, { contentType, upsert: false });
  if (uploadError) throw uploadError;
  const { error: updateError } = await supabase.from('albums').update({ cover_art_path: path }).eq('id', albumId);
  if (updateError) {
    await supabase.storage.from('attikid-artwork').remove([path]);
    throw updateError;
  }
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
