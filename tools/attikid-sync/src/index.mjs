import 'dotenv/config';
import fsp from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { createReadStream } from 'node:fs';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import chokidar from 'chokidar';
import { parseFile } from 'music-metadata';
import { createClient } from '@supabase/supabase-js';

const ROOT = path.resolve(
  process.env.ATTIKID_MEDIA_ROOT ||
    path.join(os.homedir(), 'attikid-media'),
);

const FOLDERS = {
  // Canonical library: release folders contain config.json, cover.webp, and tracks.
  audio: path.join(ROOT, 'albums'),
  release: path.join(ROOT, 'albums'),
  artwork: path.join(ROOT, 'albums'),
  video: path.join(ROOT, 'videos'),
  review: {
    audio: path.join(ROOT, '_review', 'music'),
    artwork: path.join(ROOT, '_review', 'artwork'),
    video: path.join(ROOT, '_review', 'videos'),
  },
  processed: {
    audio: path.join(ROOT, '_processed', 'music'),
    artwork: path.join(ROOT, '_processed', 'artwork'),
    video: path.join(ROOT, '_processed', 'videos'),
    duplicate: path.join(ROOT, '_processed', 'duplicates'),
  },
};

const AUDIO_EXTENSIONS = new Set(['.mp3', '.wav', '.ogg', '.m4a']);
const ARTWORK_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const VIDEO_EXTENSIONS = new Set(['.mp4', '.m4v', '.webm']);

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY =
  process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;

const BUCKETS = {
  audio: process.env.R2_AUDIO_BUCKET || 'attikid-audio',
  artwork: process.env.R2_ARTWORK_BUCKET || 'attikid-artwork',
  video: process.env.R2_VIDEOS_BUCKET || 'attikid-videos',
};

if (!SUPABASE_URL || !SUPABASE_SECRET_KEY || !R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
  throw new Error(
    'Missing required environment variables. Copy tools/attikid-sync/.env.example to .env and fill in Supabase + R2 credentials.',
  );
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

const normalize = (value = '') =>
  value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');

const slugify = (value) => normalize(value).replace(/ /g, '-');

const stripMediaSuffixes = (value) =>
  normalize(value)
    .replace(/\b(official|music|lyric|lyrics|video|visualizer|visual)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

function isSinglesReleaseDirectory(directory) {
  return normalize(path.basename(directory)) === 'singles';
}

function parseYearDate(value) {
  if (!value) return null;
  const match = String(value).match(/(\d{4})/);
  return match ? match[1] + '-01-01' : null;
}

function sanitizeMetadata(value = {}) {
  const copy = { ...value };
  delete copy.picture;
  return JSON.parse(JSON.stringify(copy, (_, item) => typeof item === 'bigint' ? Number(item) : item));
}

function parseReleaseConfig(text, format = 'json') {
  if (format === 'json') {
    const parsed = JSON.parse(text);
    if (!parsed || typeof parsed !== 'object') return null;
    const title = typeof parsed.title === 'string' ? parsed.title.trim() : '';
    if (!title) return null;
    return {
      title,
      artist: typeof parsed.artist === 'string' ? parsed.artist.trim() : '',
      released: parsed.released == null ? '' : String(parsed.released).trim(),
      trackCount: Number.isFinite(Number(parsed.no_of_tracks)) ? Number(parsed.no_of_tracks) : null,
      purpose: typeof parsed.purpose === 'string' ? parsed.purpose.trim() : '',
      details: {},
    };
  }

  const config = { title: '', artist: '', released: '', trackCount: null, purpose: '', details: {} };
  let section = 'root';

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim().replace(/^[-•]\s*/, '');
    if (!line) continue;
    if (/^details\s*:/i.test(line)) {
      section = 'details';
      continue;
    }

    const purposeMatch = line.match(/^purpose\s*-\s*(.+)$/i);
    if (purposeMatch) {
      config.purpose = purposeMatch[1].trim();
      continue;
    }

    const separator = line.indexOf(':');
    if (separator === -1) continue;

    const key = normalize(line.slice(0, separator));
    const value = line.slice(separator + 1).trim();
    const target = section === 'details' ? config.details : config;

    if (key === 'title') target.title = value;
    else if (key === 'artist') target.artist = value;
    else if (key === 'released' || key === 'release date') target.released = value;
    else if (key === 'no of tracks' || key === 'number of tracks') config.trackCount = Number(value) || null;
    else if (key === 'genre') target.genre = value;
    else if (key === 'ai platform') target.ai_platform = value;
  }

  return config.title ? config : null;
}

async function configFromFile(configPath) {
  try {
    const raw = await fsp.readFile(configPath, 'utf8');
    const format = path.extname(configPath).toLowerCase() === '.json' ? 'json' : 'txt';
    return parseReleaseConfig(raw, format);
  } catch {
    return null;
  }
}

async function findReleaseContext(filePath, titleHint = '') {
  let directory = path.dirname(filePath);
  const root = path.resolve(ROOT);

  while (directory.startsWith(root)) {
    const candidate = path.join(directory, 'config.json');
    try {
      await fsp.access(candidate);
      const config = await configFromFile(candidate);
      if (config) return { config, directory };
    } catch {
      // Keep walking toward the root.
    }
    if (directory === root) break;
    directory = path.dirname(directory);
  }

  const roots = [FOLDERS.release, path.join(ROOT, 'releases'), FOLDERS.audio];
  const wanted = normalize(titleHint);
  if (wanted) {
    for (const releaseRoot of roots) {
      try {
        const entries = await fsp.readdir(releaseRoot, { withFileTypes: true });
        for (const entry of entries.filter((item) => item.isDirectory())) {
          if (normalize(entry.name) !== wanted) continue;
          const configPath = path.join(releaseRoot, entry.name, 'config.json');
          const config = await configFromFile(configPath);
          if (config) return { config, directory: path.join(releaseRoot, entry.name) };
        }
      } catch {
        // Optional release roots may not exist yet.
      }
    }
  }

  return null;
}

async function ensureAlbumFromRelease(config, fallbackArtist = 'ATTIKID', fallbackReleaseDate = null) {
  const title = config?.title?.trim();
  if (!title) return null;

  const albums = await loadAlbums();
  const target = normalize(title);
  const existing = albums.find((album) => normalize(album.title) === target || album.slug === slugify(title));
  const releaseDate = parseYearDate(config.released) || fallbackReleaseDate || existing?.release_date || new Date().toISOString().slice(0, 10);
  const artistName = config.artist?.trim() || fallbackArtist || existing?.artist_name || 'ATTIKID';
  const metadata = {
    ...(existing?.metadata || {}),
    genre: config.details?.genre || existing?.metadata?.genre || null,
    ai_platform: config.details?.ai_platform || existing?.metadata?.ai_platform || null,
    config_track_count: config.trackCount ?? existing?.metadata?.config_track_count ?? null,
  };

  if (existing) {
    const { error } = await supabase
      .from('albums')
      .update({
        artist_name: artistName,
        release_date: releaseDate,
        description: config.purpose || existing.description || null,
        metadata,
      })
      .eq('id', existing.id);
    if (error) throw error;
    return { ...existing, artist_name: artistName, release_date: releaseDate, description: config.purpose || existing.description || null, metadata };
  }

  const album = {
    id: crypto.randomUUID(),
    title,
    artist_name: artistName,
    featured_artists: null,
    release_date: releaseDate,
    slug: slugify(title),
    description: config.purpose || null,
    cover_art_path: null,
    is_featured: false,
    metadata,
  };

  const { error } = await supabase.from('albums').insert(album);
  if (error) throw error;
  return album;
}

async function processReleaseConfig(filePath) {
  const config = await configFromFile(filePath);
  if (!config) return;
  const releaseDate = parseYearDate(config.released);
  if (isSinglesReleaseDirectory(path.dirname(filePath))) {
    log('CONFIG: Singles catalog loaded from ' + filePath);
    return;
  }
  await ensureAlbumFromRelease(config, config.artist || 'ATTIKID', releaseDate);
  log('CONFIG: "' + config.title + '" loaded from ' + filePath);
}

function kindFor(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (AUDIO_EXTENSIONS.has(ext)) return 'audio';
  if (ARTWORK_EXTENSIONS.has(ext)) return 'artwork';
  if (VIDEO_EXTENSIONS.has(ext)) return 'video';
  return null;
}

function contentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const map = {
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.ogg': 'audio/ogg',
    '.m4a': 'audio/mp4',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.mp4': 'video/mp4',
    '.m4v': 'video/x-m4v',
    '.webm': 'video/webm',
  };
  return map[ext] || 'application/octet-stream';
}

function dateFromMetadata(metadata, fallback) {
  const raw = metadata.common?.date || metadata.common?.year;
  if (typeof raw === 'number' && raw >= 1900) return `${raw}-01-01`;
  if (typeof raw === 'string') {
    const match = raw.match(/(\\d{4})(?:[-/](\\d{1,2})(?:[-/](\\d{1,2}))?)?/);
    if (match) {
      const year = match[1];
      const month = String(match[2] || '1').padStart(2, '0');
      const day = String(match[3] || '1').padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  }
  return fallback || null;
}

async function ensureDirectories() {
  const paths = [
    FOLDERS.audio,
    FOLDERS.release,
    FOLDERS.artwork,
    FOLDERS.video,
    FOLDERS.review.audio,
    FOLDERS.review.artwork,
    FOLDERS.review.video,
    FOLDERS.processed.audio,
    FOLDERS.processed.artwork,
    FOLDERS.processed.video,
    FOLDERS.processed.duplicate,
  ];
  await Promise.all(paths.map((p) => fsp.mkdir(p, { recursive: true })));
}

async function fileHash(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = createReadStream(filePath);
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(hash.digest('hex')));
  });
}

async function waitForStableFile(filePath) {
  let previous = null;
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const stat = await fsp.stat(filePath);
    const signature = `${stat.size}:${stat.mtimeMs}`;
    if (signature === previous && stat.size > 0) return stat;
    previous = signature;
    await new Promise((resolve) => setTimeout(resolve, 750));
  }
  return fsp.stat(filePath);
}

async function archiveFile(filePath, destinationRoot, label) {
  const ext = path.extname(filePath);
  const stem = path.basename(filePath, ext);
  const folder = path.join(destinationRoot, new Date().toISOString().slice(0, 7));
  await fsp.mkdir(folder, { recursive: true });
  const safeStem = stem.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/-+/g, '-');
  let target = path.join(folder, `${safeStem}${ext}`);
  try {
    await fsp.access(target);
    target = path.join(folder, `${safeStem}-${Date.now()}${ext}`);
  } catch {
    // target does not exist
  }
  await fsp.rename(filePath, target);
  log(`${label}: ${target}`);
}

async function moveToReview(filePath, kind, reason, details = {}) {
  const targetRoot = FOLDERS.review[kind];
  const ext = path.extname(filePath);
  const stem = path.basename(filePath, ext);
  const target = path.join(targetRoot, `${stem}${ext}`);
  await fsp.copyFile(filePath, target);
  await fsp.writeFile(
    `${target}.json`,
    JSON.stringify({ reason, source: filePath, ...details }, null, 2),
    'utf8',
  );
  log(`REVIEW: ${reason} → ${target}`);
}

async function hasBeenIngested(hash) {
  const { data, error } = await supabase
    .from('media_ingest')
    .select('id,status,storage_path')
    .eq('file_hash', hash)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function logIngest(entry) {
  const { error } = await supabase.from('media_ingest').insert(entry);
  if (error && !String(error.message).toLowerCase().includes('duplicate')) throw error;
}

function log(message) {
  console.log(`[${new Date().toLocaleTimeString()}] ${message}`);
}

async function loadAlbums() {
  const { data, error } = await supabase
    .from('albums')
    .select('id,title,slug,release_date,artist_name,cover_art_path,description,metadata');
  if (error) throw error;
  return data || [];
}

async function findAlbum(label) {
  const albums = await loadAlbums();
  const target = normalize(label);
  const exact = albums.filter(
    (album) => normalize(album.title) === target || album.slug === slugify(label),
  );
  return exact.length === 1 ? exact[0] : null;
}

async function findSong(title) {
  const { data, error } = await supabase
    .from('songs')
    .select('id,title,album_id,artist_name,slug,audio_path,albums(title,slug)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  const target = normalize(title);
  const matches = (data || []).filter((song) => normalize(song.title) === target);
  return matches.length === 1 ? matches[0] : null;
}

async function findSongInAlbum(albumId, title) {
  const { data, error } = await supabase
    .from('songs')
    .select('id,title,album_id,artist_name,slug')
    .eq('album_id', albumId);
  if (error) throw error;
  const target = normalize(title);
  const matches = (data || []).filter((song) => normalize(song.title) === target);
  return matches.length === 1 ? matches[0] : null;
}

async function findStandaloneSong(title) {
  const { data, error } = await supabase
    .from('songs')
    .select('id,title,album_id,artist_name,slug,audio_path,artwork_path')
    .is('album_id', null);
  if (error) throw error;
  const target = normalize(title);
  const matches = (data || []).filter((song) => normalize(song.title) === target);
  return matches.length === 1 ? matches[0] : null;
}

async function uploadToR2(kind, key, filePath) {
  const bucket = BUCKETS[kind];
  const body = createReadStream(filePath);
  const stat = await fsp.stat(filePath);

  await r2.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentLength: stat.size,
      ContentType: contentType(filePath),
      CacheControl: 'public, max-age=31536000, immutable',
    }),
  );
}

async function removeFromR2(kind, key) {
  try {
    await r2.send(new DeleteObjectCommand({ Bucket: BUCKETS[kind], Key: key }));
  } catch {
    // Best-effort cleanup.
  }
}

async function processAudio(filePath) {
  const hash = await fileHash(filePath);
  if (await hasBeenIngested(hash)) {
    await archiveFile(filePath, FOLDERS.processed.duplicate, 'DUPLICATE');
    return;
  }

  const metadata = await parseFile(filePath, { duration: true });
  const releaseContext = await findReleaseContext(filePath, metadata.common?.album?.trim() || '');
  const title = metadata.common?.title?.trim() || path.basename(filePath, path.extname(filePath));
  const singlesRelease = releaseContext?.directory ? isSinglesReleaseDirectory(releaseContext.directory) : false;
  const configTitle = singlesRelease ? '' : releaseContext?.config?.title?.trim() || '';
  const albumTitle = singlesRelease ? '' : metadata.common?.album?.trim() || configTitle;
  const artist = metadata.common?.artist?.trim() || releaseContext?.config?.artist?.trim() || 'ATTIKID';
  const releaseDate = dateFromMetadata(metadata, parseYearDate(releaseContext?.config?.released));

  const album = albumTitle
    ? await ensureAlbumFromRelease(
        releaseContext?.config || {
          title: albumTitle,
          artist,
          released: releaseDate || '',
          trackCount: null,
          purpose: '',
          details: {},
        },
        artist,
        releaseDate,
      )
    : null;

  const duplicate = album
    ? await findSongInAlbum(album.id, title)
    : await findStandaloneSong(title);

  if (duplicate) {
    await logIngest({
      file_hash: hash,
      source_name: path.basename(filePath),
      media_type: 'audio',
      status: 'duplicate',
      album_id: album?.id ?? null,
      song_id: duplicate.id,
      metadata: sanitizeMetadata(metadata.common),
    });
    await archiveFile(filePath, FOLDERS.processed.duplicate, 'DUPLICATE');
    return;
  }

  const songId = crypto.randomUUID();
  const ext = path.extname(filePath).toLowerCase() || '.mp3';
  const keyPrefix = album ? 'albums/' + album.slug : 'singles/' + slugify(title);
  const key = 'audio/' + keyPrefix + '/' + songId + ext;
  const dbPath = 'r2:' + key;

  await uploadToR2('audio', key, filePath);

  const duration = Number.isFinite(metadata.format?.duration) ? metadata.format.duration : null;
  const trackNumber = Number.isFinite(metadata.common?.track?.no) ? metadata.common.track.no : null;
  const trackMetadata = {
    ...sanitizeMetadata(metadata.common),
    title,
    artist,
    album: album?.title || null,
    release_date: releaseDate,
    genre: metadata.common?.genre?.[0] || releaseContext?.config?.details?.genre || null,
    ai_platform: releaseContext?.config?.details?.ai_platform || null,
    track_number: trackNumber,
    track_total: Number.isFinite(metadata.common?.track?.of) ? metadata.common.track.of : null,
  };

  const { error } = await supabase.from('songs').insert({
    id: songId,
    album_id: album?.id ?? null,
    title,
    artist_name: artist,
    track_number: trackNumber,
    slug: slugify(title) + '-' + songId.slice(0, 8),
    audio_path: dbPath,
    audio_mime_type: contentType(filePath),
    file_size: (await fsp.stat(filePath)).size,
    duration_seconds: duration,
    release_date: releaseDate,
    metadata: trackMetadata,
  });

  if (error) {
    await removeFromR2('audio', key);
    throw error;
  }

  await logIngest({
    file_hash: hash,
    source_name: path.basename(filePath),
    media_type: 'audio',
    status: 'processed',
    album_id: album?.id ?? null,
    song_id: songId,
    storage_bucket: BUCKETS.audio,
    storage_path: dbPath,
    metadata: trackMetadata,
  });

  await archiveFile(filePath, FOLDERS.processed.audio, 'IMPORTED');
  log('MUSIC: "' + title + '" → ' + (album?.title || 'standalone single'));
}

function artworkLabel(filePath) {
  return path.basename(filePath, path.extname(filePath))
    .replace(/[_-]+/g, ' ')
    .replace(/\b(cover|art|artwork|front)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function processArtwork(filePath) {
  const hash = await fileHash(filePath);
  if (await hasBeenIngested(hash)) {
    await archiveFile(filePath, FOLDERS.processed.duplicate, 'DUPLICATE');
    return;
  }

  const label = artworkLabel(filePath);
  const releaseContext = await findReleaseContext(filePath, label);
  const singlesRelease = releaseContext?.directory ? isSinglesReleaseDirectory(releaseContext.directory) : false;
  const album = !singlesRelease && releaseContext?.config
    ? await ensureAlbumFromRelease(releaseContext.config, releaseContext.config.artist || 'ATTIKID', parseYearDate(releaseContext.config.released))
    : !singlesRelease
      ? await findAlbum(label)
      : null;
  const song = album ? null : await findStandaloneSong(stripMediaSuffixes(label));

  if (!album && !song) {
    await moveToReview(filePath, 'artwork', 'No unique release or single match for "' + label + '"');
    await logIngest({
      file_hash: hash,
      source_name: path.basename(filePath),
      media_type: 'artwork',
      status: 'review_required',
      metadata: { label },
    });
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const keyPrefix = album ? 'albums/' + album.slug : 'singles/' + song.slug;
  const key = 'artwork/' + keyPrefix + '/' + hash.slice(0, 16) + ext;
  const dbPath = 'r2:' + key;

  await uploadToR2('artwork', key, filePath);

  const update = album
    ? supabase.from('albums').update({ cover_art_path: dbPath }).eq('id', album.id)
    : supabase.from('songs').update({ artwork_path: dbPath }).eq('id', song.id);

  const { error } = await update;
  if (error) {
    await removeFromR2('artwork', key);
    throw error;
  }

  await logIngest({
    file_hash: hash,
    source_name: path.basename(filePath),
    media_type: 'artwork',
    status: 'processed',
    album_id: album?.id ?? null,
    song_id: song?.id ?? null,
    storage_bucket: BUCKETS.artwork,
    storage_path: dbPath,
    metadata: { label },
  });

  await archiveFile(filePath, FOLDERS.processed.artwork, 'IMPORTED');
  log('ARTWORK: "' + path.basename(filePath) + '" → ' + (album?.title || song?.title));
}

async function processVideo(filePath) {
  const hash = await fileHash(filePath);
  if (await hasBeenIngested(hash)) {
    await archiveFile(filePath, FOLDERS.processed.duplicate, 'DUPLICATE');
    return;
  }

  const metadata = await parseFile(filePath, { duration: true });
  const rawTitle =
    metadata.common?.title?.trim() ||
    path.basename(filePath, path.extname(filePath));
  const candidateTitle = stripMediaSuffixes(rawTitle);

  const song = await findSong(rawTitle) || await findSong(candidateTitle);
  if (!song) {
    await moveToReview(filePath, 'video', `No unique song match for "${rawTitle}"`, {
      metadata: metadata.common,
    });
    await logIngest({ file_hash: hash, source_name: path.basename(filePath), media_type: 'video', status: 'review_required', metadata: metadata.common });
    return;
  }

  const key = `videos/${song.id}/${hash.slice(0, 16)}.mp4`;
  const dbPath = `r2:${key}`;

  await uploadToR2('video', key, filePath);

  const { data: existing } = await supabase
    .from('lyric_videos')
    .select('id')
    .eq('song_id', song.id)
    .eq('video_path', dbPath)
    .maybeSingle();

  if (!existing) {
    const { error } = await supabase.from('lyric_videos').insert({
      song_id: song.id,
      title: rawTitle,
      video_path: dbPath,
      video_mime_type: contentType(filePath),
      file_size: (await fsp.stat(filePath)).size,
      duration_seconds: Number.isFinite(metadata.format?.duration) ? metadata.format.duration : null,
      published: true,
    });

    if (error) {
      await removeFromR2('video', key);
      throw error;
    }
  }

  await logIngest({
    file_hash: hash,
    source_name: path.basename(filePath),
    media_type: 'video',
    status: 'processed',
    song_id: song.id,
    storage_bucket: BUCKETS.video,
    storage_path: dbPath,
    metadata: metadata.common,
  });

  await archiveFile(filePath, FOLDERS.processed.video, 'IMPORTED');
  log(`VIDEO: "${rawTitle}" → ${song.title}`);
}

async function processFile(filePath) {
  const kind = kindFor(filePath);
  if (!kind) return;

  try {
    await waitForStableFile(filePath);

    if (kind === 'audio') await processAudio(filePath);
    if (kind === 'artwork') await processArtwork(filePath);
    if (kind === 'video') await processVideo(filePath);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log(`FAILED: ${path.basename(filePath)} → ${message}`);
    try {
      await moveToReview(filePath, kind, message);
      const hash = await fileHash(filePath);
      await logIngest({
        file_hash: hash,
        source_name: path.basename(filePath),
        media_type: kind,
        status: 'failed',
        error: message,
      });
    } catch {
      // Preserve the original failure.
    }
  }
}

async function collectFiles(root) {
  const files = [];
  async function walk(directory) {
    const entries = await fsp.readdir(directory, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) await walk(fullPath);
      else if (entry.isFile()) files.push(fullPath);
    }
  }
  await walk(root);
  return files;
}

async function initialScan() {
  const roots = [...new Set([FOLDERS.release, FOLDERS.video])];
  for (const root of roots) {
    for (const file of await collectFiles(root)) {
      if (path.basename(file).toLowerCase() === 'config.json') await processReleaseConfig(file);
      else await processFile(file);
    }
  }
}

await ensureDirectories();

log(`ATTIKID MEDIA SYNC → ${ROOT}`);
log('Folders ready: albums / videos');
log('Review queue: _review/');
log('Archive: _processed/');

if (process.argv.includes('--once')) {
  await initialScan();
  process.exit(0);
}

const watcher = chokidar.watch(
  [...new Set([FOLDERS.release, FOLDERS.video])],
  {
    ignoreInitial: false,
    awaitWriteFinish: {
      stabilityThreshold: 1500,
      pollInterval: 250,
    },
    ignored: (candidatePath) => {
      const name = path.basename(candidatePath);
      return name.startsWith('.') || (name.endsWith('.json') && name.toLowerCase() !== 'config.json');
    },
  },
);

watcher.on('add', (filePath) => {
  if (path.basename(filePath).toLowerCase() === 'config.json') void processReleaseConfig(filePath);
  else void processFile(filePath);
});

watcher.on('change', (filePath) => {
  if (path.basename(filePath).toLowerCase() === 'config.json') void processReleaseConfig(filePath);
});

watcher.on('error', (error) => {
  log(`WATCHER ERROR: ${error instanceof Error ? error.message : String(error)}`);
});

process.on('SIGINT', async () => {
  await watcher.close();
  log('ATTIKID MEDIA SYNC stopped.');
  process.exit(0);
});