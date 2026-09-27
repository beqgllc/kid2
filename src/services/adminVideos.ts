import { requireSupabase } from '../lib/supabase/client';
import { slugify } from '../lib/utils';
import type { LyricVideo } from '../types/models';
import { mediaUrl } from './mediaUrls';

function extension(file: File) {
  return file.name.split('.').pop()?.toLowerCase() || 'mp4';
}

function videoContentType(file: File) {
  if (file.type.startsWith('video/')) return file.type;
  const types: Record<string, string> = { mp4: 'video/mp4', webm: 'video/webm', mov: 'video/quicktime' };
  return types[extension(file)] || 'video/mp4';
}

function getVideoDuration(file: File) {
  return new Promise<number>((resolve) => {
    const video = document.createElement('video');
    const url = URL.createObjectURL(file);
    const cleanup = () => { URL.revokeObjectURL(url); video.remove(); };
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      const duration = Number.isFinite(video.duration) ? video.duration : 0;
      cleanup();
      resolve(duration);
    };
    video.onerror = () => { cleanup(); resolve(0); };
    video.src = url;
  });
}

function mapVideo(row: any): LyricVideo {
  return {
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
    song: row.songs ? {
      id: row.songs.id,
      title: row.songs.title,
      artist_name: row.songs.artist_name,
      slug: row.songs.slug,
      album_title: row.songs.albums?.title ?? null,
    } : null,
  };
}

export async function getAdminLyricVideos(): Promise<LyricVideo[]> {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('lyric_videos')
    .select('*, songs(id,title,artist_name,slug,albums(title,slug,cover_art_path))')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapVideo);
}

export async function uploadLyricVideo(input: {
  file: File;
  songId: string;
  title: string;
  published?: boolean;
  thumbnail?: File | null;
}) {
  if (!input.file.type.startsWith('video/') && !['mp4', 'webm', 'mov'].includes(extension(input.file))) {
    throw new Error('Choose an MP4, WebM, or MOV video.');
  }
  if (input.file.size <= 0) throw new Error('The video file is empty.');
  if (input.file.size > 2 * 1024 * 1024 * 1024) throw new Error('Video files must be 2 GB or smaller.');

  const supabase = requireSupabase();
  const videoId = crypto.randomUUID();
  const path = 'videos/' + input.songId + '/' + videoId + '.' + extension(input.file);
  const contentType = videoContentType(input.file);
  const durationSeconds = await getVideoDuration(input.file);

  const { error: uploadError } = await supabase.storage.from('attikid-videos').upload(path, input.file, {
    contentType,
    upsert: false,
  });
  if (uploadError) throw uploadError;

  let thumbnailPath: string | null = null;
  try {
    if (input.thumbnail) {
      const thumbExt = input.thumbnail.name.split('.').pop()?.toLowerCase() || 'jpg';
      thumbnailPath = 'video-thumbnails/' + videoId + '.' + thumbExt;
      const { error: thumbError } = await supabase.storage.from('attikid-artwork').upload(thumbnailPath, input.thumbnail, {
        contentType: input.thumbnail.type || 'image/jpeg',
        upsert: false,
      });
      if (thumbError) throw thumbError;
    }

    const { data, error } = await supabase.from('lyric_videos').insert({
      id: videoId,
      song_id: input.songId,
      title: input.title.trim() || 'ATTIKID Visual',
      video_path: path,
      video_mime_type: contentType,
      file_size: input.file.size,
      duration_seconds: durationSeconds || null,
      thumbnail_path: thumbnailPath,
      published: input.published ?? true,
    }).select().single();

    if (error) throw error;
    return mapVideo(data);
  } catch (error) {
    await supabase.storage.from('attikid-videos').remove([path]);
    if (thumbnailPath) await supabase.storage.from('attikid-artwork').remove([thumbnailPath]);
    throw error;
  }
}

export async function updateLyricVideo(videoId: string, patch: { title?: string; published?: boolean; song_id?: string }) {
  const supabase = requireSupabase();
  const { data, error } = await supabase.from('lyric_videos').update(patch).eq('id', videoId).select('*, songs(id,title,artist_name,slug,albums(title,slug,cover_art_path))').single();
  if (error) throw error;
  return mapVideo(data);
}

export async function deleteLyricVideo(video: LyricVideo) {
  const supabase = requireSupabase();
  const { error: storageError } = await supabase.storage.from('attikid-videos').remove([video.video_path]);
  if (storageError) throw storageError;
  if (video.thumbnail_path) await supabase.storage.from('attikid-artwork').remove([video.thumbnail_path]);
  const { error } = await supabase.from('lyric_videos').delete().eq('id', video.id);
  if (error) throw error;
}
