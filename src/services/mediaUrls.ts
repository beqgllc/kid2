import { requireSupabase } from '../lib/supabase/client';

const R2_AUDIO_BASE_URL = (import.meta.env.VITE_R2_AUDIO_PUBLIC_BASE_URL as string | undefined)?.replace(/\/+$/, '');
const R2_ARTWORK_BASE_URL = (import.meta.env.VITE_R2_ARTWORK_PUBLIC_BASE_URL as string | undefined)?.replace(/\/+$/, '');
const R2_VIDEO_BASE_URL = (import.meta.env.VITE_R2_VIDEO_PUBLIC_BASE_URL as string | undefined)?.replace(/\/+$/, '');

function encodePath(path: string) {
  return path.split('/').map(encodeURIComponent).join('/');
}

export function mediaUrl(bucket: string, path: string | null) {
  if (!path) return null;

  if (path.startsWith('r2:')) {
    const key = path.slice(3);
    const prefix = key.split('/')[0];
    const base =
      prefix === 'audio'
        ? R2_AUDIO_BASE_URL
        : prefix === 'artwork'
          ? R2_ARTWORK_BASE_URL
          : prefix === 'videos'
            ? R2_VIDEO_BASE_URL
            : undefined;

    if (!base) {
      throw new Error(`Missing R2 public base URL for ${prefix} media.`);
    }

    return `${base}/${encodePath(key)}`;
  }

  const client = requireSupabase();
  return client.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}
