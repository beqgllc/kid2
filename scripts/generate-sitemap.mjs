import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const DEFAULT_SITE_URL = 'https://attikid.com';

function resolveSiteUrl() {
  const configured = process.env.VITE_SITE_URL?.trim();
  if (!configured) return DEFAULT_SITE_URL;

  try {
    const parsed = new URL(configured);
    if (parsed.hostname.toLowerCase() === 'attikid.vercel.app') return DEFAULT_SITE_URL;
    return parsed.origin;
  } catch {
    console.warn('[sitemap] Invalid VITE_SITE_URL; using https://attikid.com.');
    return DEFAULT_SITE_URL;
  }
}

const siteUrl = resolveSiteUrl();
const staticPaths = [
  '/',
  '/music/albums',
  '/music/songs',
  '/lyrics',
  '/about',
  '/videos',
  '/fan-mail',
  '/privacy',
  '/terms',
  '/store',
  '/studio',
];
const urls = new Map();

function addUrl(path, lastmod) {
  const normalizedPath = path === '/' ? '/' : '/' + path.replace(/^\/+|\/+$/g, '');
  const existing = urls.get(normalizedPath);
  const date = lastmod && Number.isFinite(Date.parse(lastmod))
    ? new Date(lastmod).toISOString().slice(0, 10)
    : undefined;
  urls.set(normalizedPath, {
    loc: siteUrl + normalizedPath,
    lastmod: date || existing?.lastmod,
  });
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function readPublicRows(table, select) {
  const endpoint = process.env.VITE_SUPABASE_URL?.trim().replace(/\/+$/, '');
  const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!endpoint || !key) return null;

  const response = await fetch(endpoint + '/rest/v1/' + table + '?select=' + select, {
    headers: {
      apikey: key,
      Authorization: 'Bearer ' + key,
    },
  });

  if (!response.ok) {
    console.warn('[sitemap] Could not read the public ' + table + ' catalog (HTTP ' + response.status + ').');
    return [];
  }

  const rows = await response.json();
  return Array.isArray(rows) ? rows : [];
}

for (const path of staticPaths) addUrl(path);

const endpointConfigured =
  Boolean(process.env.VITE_SUPABASE_URL?.trim()) &&
  Boolean(process.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim());

if (endpointConfigured) {
  const [albumsResult, songsResult, lyricsResult] = await Promise.allSettled([
    readPublicRows('albums', 'slug,updated_at'),
    readPublicRows('songs', 'id,slug,updated_at'),
    readPublicRows('lyrics', 'song_id'),
  ]);

  const albums = albumsResult.status === 'fulfilled' ? albumsResult.value ?? [] : [];
  const songs = songsResult.status === 'fulfilled' ? songsResult.value ?? [] : [];
  const lyrics = lyricsResult.status === 'fulfilled' ? lyricsResult.value ?? [] : [];

  for (const album of albums) {
    if (typeof album.slug === 'string' && album.slug.trim()) {
      addUrl('/music/' + encodeURIComponent(album.slug), album.updated_at);
    }
  }

  const songsById = new Map();
  for (const song of songs) {
    if (typeof song.slug !== 'string' || !song.slug.trim()) continue;
    addUrl('/song/' + encodeURIComponent(song.slug), song.updated_at);
    if (song.id) songsById.set(song.id, song.slug);
  }

  for (const lyric of lyrics) {
    const slug = songsById.get(lyric.song_id);
    if (slug) addUrl('/lyrics/' + encodeURIComponent(slug));
  }
} else {
  console.info('[sitemap] Supabase build variables are not set; generating the core-page sitemap only.');
}

const urlEntries = [...urls.values()]
  .sort((a, b) => a.loc.localeCompare(b.loc))
  .map((entry) => {
    const lastmod = entry.lastmod ? '<lastmod>' + escapeXml(entry.lastmod) + '</lastmod>' : '';
    return '  <url><loc>' + escapeXml(entry.loc) + '</loc>' + lastmod + '</url>';
  })
  .join('\n');

const sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n'
  + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
  + urlEntries + '\n'
  + '</urlset>\n';

const outputPath = fileURLToPath(new URL('../public/sitemap.xml', import.meta.url));
await writeFile(outputPath, sitemap, 'utf8');
console.info('[sitemap] Wrote ' + urls.size + ' public URLs to public/sitemap.xml for ' + siteUrl + '.');
