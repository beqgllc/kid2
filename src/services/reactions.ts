import { requireSupabase } from '../lib/supabase/client';
import type { Reaction } from '../types/models';
import { ensureAnonymousSession } from '../utils/visitor';

export async function getMyReaction(songId: string): Promise<Reaction | null> {
  const session = await ensureAnonymousSession();
  if (!session?.user) return null;
  const supabase = requireSupabase();
  const { data, error } = await supabase.from('reactions').select('reaction').eq('song_id', songId).eq('visitor_id', session.user.id).maybeSingle();
  if (error) throw error;
  return (data?.reaction as Reaction | undefined) ?? null;
}

export async function setReaction(songId: string, reaction: Reaction | null) {
  const session = await ensureAnonymousSession();
  if (!session?.user) throw new Error('Visitor session unavailable.');
  const supabase = requireSupabase();
  if (!reaction) {
    const { error } = await supabase.from('reactions').delete().eq('song_id', songId).eq('visitor_id', session.user.id);
    if (error) throw error;
    return null;
  }
  const { data, error } = await supabase.from('reactions').upsert({ song_id: songId, visitor_id: session.user.id, reaction }, { onConflict: 'song_id,visitor_id' }).select().single();
  if (error) throw error;
  return data;
}
