import { requireSupabase } from '../lib/supabase/client';
import { mediaUrl } from './mediaUrls';
import type { LyricVideo } from '../types/models';

export async function getLyricVideos(): Promise<LyricVideo[]> {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('lyric_videos')
    .select('*, songs(id,title,artist_name,slug,albums(title,slug,cover_art_path))')
    .eq('published', true)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    id: row.id,
    song_id: row.song_id,
    title: row.title,
    video_path: row.video_path,
    video_mime_type: row.video_mime_type,
    file_size: row.file_size,
    duration_seconds: row.duration_seconds,
    thumbnail_path: row.thumbnail_path,
    published: row.published,
    created_at: row.created_at,
    updated_at: row.updated_at,
    video_url: mediaUrl('attikid-videos', row.video_path),
    thumbnail_url: mediaUrl('attikid-artwork', row.thumbnail_path),
    song: row.songs
      ? {
          id: row.songs.id,
          title: row.songs.title,
          artist_name: row.songs.artist_name,
          slug: row.songs.slug,
          album_title: row.songs.albums?.title ?? null,
        }
      : null,
  }));
}
