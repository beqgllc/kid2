import { requireSupabase } from '../lib/supabase/client';
import type { Lyrics } from '../types/models';

export async function getLyrics(songId: string): Promise<Lyrics | null> {
  const supabase = requireSupabase();
  const { data, error } = await supabase.from('lyrics').select('*').eq('song_id', songId).maybeSingle();
  if (error) throw error;
  return data;
}

export async function getLyricsMap(songIds: string[]) {
  if (!songIds.length) return new Map<string, Lyrics>();
  const supabase = requireSupabase();
  const { data, error } = await supabase.from('lyrics').select('*').in('song_id', songIds);
  if (error) throw error;
  return new Map((data ?? []).map((row) => [row.song_id, row as Lyrics]));
}

export async function upsertLyrics(songId: string, content: string) {
  const supabase = requireSupabase();
  const { data, error } = await supabase.from('lyrics').upsert({ song_id: songId, content }, { onConflict: 'song_id' }).select().single();
  if (error) throw error;
  return data as Lyrics;
}

export async function deleteLyrics(id: string) {
  const supabase = requireSupabase();
  const { error } = await supabase.from('lyrics').delete().eq('id', id);
  if (error) throw error;
}
