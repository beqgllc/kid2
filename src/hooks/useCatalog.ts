import { useEffect, useState } from 'react';
import { getAlbums, getAlbumBySlug, getFeaturedAlbum, getFeaturedSong, getLatestAlbum, getLatestSongs, getSongBySlug, getSongByTitle, getSongs } from '../services/catalog';
import type { Album, Song } from '../types/models';

export function useAlbums(limit?: number) {
  const [data, setData] = useState<Album[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null);
  useEffect(() => { getAlbums(limit).then(setData).catch((e) => setError(e.message)).finally(() => setLoading(false)); }, [limit]);
  return { data, loading, error };
}
export function useAlbum(slug: string) {
  const [data, setData] = useState<Album | null>(null); const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null);
  useEffect(() => { getAlbumBySlug(slug).then(setData).catch((e) => setError(e.message)).finally(() => setLoading(false)); }, [slug]);
  return { data, loading, error };
}
export function useFeaturedAlbum() {
  const [data, setData] = useState<Album | null>(null); const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    getFeaturedAlbum().then((featured) => featured ?? getLatestAlbum()).then(setData).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, []);
  return { data, loading, error };
}
export function useFeaturedSong() {
  const [data, setData] = useState<Song | null>(null); const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    getFeaturedSong().then(setData).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, []);
  return { data, loading, error };
}
export function useSongByTitle(title: string) {
  const [data, setData] = useState<Song | null>(null); const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null);
  useEffect(() => { getSongByTitle(title).then(setData).catch((e) => setError(e.message)).finally(() => setLoading(false)); }, [title]);
  return { data, loading, error };
}
export function useSongs(albumId?: string, limit?: number) {
  const [data, setData] = useState<Song[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null);
  useEffect(() => { getSongs({ albumId, limit }).then(setData).catch((e) => setError(e.message)).finally(() => setLoading(false)); }, [albumId, limit]);
  return { data, loading, error };
}
export function useLatestSongs(limit = 6) {
  const [data, setData] = useState<Song[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null);
  useEffect(() => { getLatestSongs(limit).then(setData).catch((e) => setError(e.message)).finally(() => setLoading(false)); }, [limit]);
  return { data, loading, error };
}
export function useSong(slug: string) {
  const [data, setData] = useState<Song | null>(null); const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null);
  useEffect(() => { getSongBySlug(slug).then(setData).catch((e) => setError(e.message)).finally(() => setLoading(false)); }, [slug]);
  return { data, loading, error };
}
