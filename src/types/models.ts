export type Reaction = 'like' | 'dislike';
export type RepeatMode = 'none' | 'queue' | 'track';
export type PlaybackStatus = 'idle' | 'loading' | 'ready' | 'playing' | 'paused' | 'ended' | 'error';
export type UploadStatus = 'queued' | 'validating' | 'uploading' | 'processing' | 'complete' | 'failed' | 'cancelled';

export interface Album {
  id: string;
  title: string;
  artist_name: string;
  release_date: string;
  slug: string;
  description: string | null;
  cover_art_path: string | null;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  song_count?: number;
  cover_url?: string | null;
}

export interface Song {
  id: string;
  album_id: string;
  title: string;
  artist_name: string;
  track_number: number | null;
  slug: string;
  audio_path: string;
  audio_mime_type: string | null;
  file_size: number | null;
  duration_seconds: number | null;
  release_date: string | null;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  album?: Album | null;
  artwork_url?: string | null;
  audio_url?: string | null;
  has_lyrics?: boolean;
  play_count?: number;
  like_count?: number;
  dislike_count?: number;
  comment_count?: number;
}

export interface Lyrics {
  id: string;
  song_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  song_id: string;
  visitor_id: string;
  display_name: string | null;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface FanMail {
  id: string;
  sender_name: string | null;
  sender_email: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface AnalyticsSummary {
  total_plays: number;
  total_songs: number;
  total_albums: number;
  total_likes: number;
  total_dislikes: number;
  total_comments: number;
  unread_fan_mail: number;
}

export interface SongAnalytics {
  song_id: string;
  play_count: number;
  like_count: number;
  dislike_count: number;
  comment_count: number;
}

export interface AlbumAnalytics {
  album_id: string;
  play_count: number;
  like_count: number;
  dislike_count: number;
  comment_count: number;
}

export interface UploadJob {
  id: string;
  file: File;
  title: string;
  artist_name: string;
  album_id: string;
  release_date?: string;
  track_number?: number;
  progress: number;
  status: UploadStatus;
  error?: string;
}

export interface PlayerSong extends Song {
  audio_url: string;
}
