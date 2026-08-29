import { requireSupabase } from '../lib/supabase/client';
import { ensureAnonymousSession } from '../utils/visitor';
import type { AlbumAnalytics, AnalyticsSummary, SongAnalytics } from '../types/models';

export async function recordPlay(songId: string, sessionId: string) {
  const supabase = requireSupabase();
  const session = await ensureAnonymousSession().catch(() => null);
  await supabase.from('play_events').insert({ song_id: songId, visitor_id: session?.user?.id ?? null, session_id: sessionId });
}

export async function getSummary(): Promise<AnalyticsSummary> {
  const supabase = requireSupabase();
  const { data, error } = await supabase.from('admin_analytics_summary').select('*').single();
  if (error) throw error;
  return data as AnalyticsSummary;
}

export async function getSongAnalytics() {
  const supabase = requireSupabase();
  const { data, error } = await supabase.from('song_analytics').select('*').order('play_count', { ascending: false });
  if (error) throw error;
  return (data ?? []) as SongAnalytics[];
}

export async function getAlbumAnalytics() {
  const supabase = requireSupabase();
  const { data, error } = await supabase.from('album_analytics').select('*').order('play_count', { ascending: false });
  if (error) throw error;
  return (data ?? []) as AlbumAnalytics[];
}
