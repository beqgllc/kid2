import { requireSupabase } from '../lib/supabase/client';
import { assertText } from '../lib/validation';
import { ensureAnonymousSession } from '../utils/visitor';
import type { Comment } from '../types/models';

export async function getComments(songId: string, limit = 30): Promise<Comment[]> {
  const supabase = requireSupabase();
  const { data, error } = await supabase.from('comments').select('*').eq('song_id', songId).order('created_at', { ascending: false }).limit(limit);
  if (error) throw error;
  return (data ?? []) as Comment[];
}

export async function getAllComments(): Promise<(Comment & { song?: { title: string; slug: string } | null })[]> {
  const supabase = requireSupabase();
  const { data, error } = await supabase.from('comments').select('*, songs(title, slug)').order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as (Comment & { song?: { title: string; slug: string } | null })[];
}

export async function updateComment(commentId: string, patch: { display_name: string; content: string }) {
  const supabase = requireSupabase();
  const payload = { display_name: patch.display_name.trim().slice(0, 80) || 'Anonymous', content: assertText(patch.content, 'Comment', 1, 2000) };
  const { data, error } = await supabase.from('comments').update(payload).eq('id', commentId).select().single();
  if (error) throw error;
  return data as Comment;
}

export async function deleteComment(commentId: string) {
  const supabase = requireSupabase();
  const { error } = await supabase.from('comments').delete().eq('id', commentId);
  if (error) throw error;
}

export async function addComment(songId: string, displayName: string, content: string) {
  const session = await ensureAnonymousSession();
  if (!session?.user) throw new Error('Visitor session unavailable.');
  const supabase = requireSupabase();
  const payload = {
    song_id: songId,
    visitor_id: session.user.id,
    display_name: displayName.trim().slice(0, 80) || 'Anonymous',
    content: assertText(content, 'Comment', 1, 2000),
  };
  const { data, error } = await supabase.from('comments').insert(payload).select().single();
  if (error) throw error;
  return data as Comment;
}
