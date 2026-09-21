# ATTIKID Media Sync

A local Windows media drop-zone for the ATTIKID site.

## Folders

The default root is `%USERPROFILE%\\ATTIKID-MEDIA`:

```
ATTIKID-MEDIA/
  music/
  artwork/
  videos/
  _review/
    music/
    artwork/
    videos/
  _processed/
    music/
    artwork/
    videos/
    duplicates/
```

Run `npm install`, then `npm run setup` once.

## Credentials

Copy `.env.example` to `.env` and fill in:

- Supabase project URL
- Supabase secret/service-role key
- Cloudflare R2 account ID
- R2 access key
- R2 secret key
- R2 bucket names

The secret keys are used only by this local Node process. Never put them in Vite `VITE_*` variables or commit `.env`.

## Storage

Create these R2 buckets:

- `attikid-audio`
- `attikid-artwork`
- `attikid-videos`

The audio bucket you already created can be reused. Configure public read access and CORS for each bucket. The browser-side base URLs go in Vercel as:

```
VITE_R2_AUDIO_PUBLIC_BASE_URL=
VITE_R2_ARTWORK_PUBLIC_BASE_URL=
VITE_R2_VIDEO_PUBLIC_BASE_URL=
```

## Database

Run the new Supabase migrations in the main repo:

- `018_media_ingest.sql`
- `019_lyric_videos.sql`
- `020_media_triggers.sql`

## How importing works

### Music

Drop an MP3 into `music/`.

The sync reads ID3 metadata:

- title
- artist
- album
- track number
- release/year
- duration

It matches the album to an existing release. If exactly one release matches, the MP3 is uploaded to R2 and a new `songs` row is created. If the release cannot be matched uniquely, the file is copied to `_review/music/` and nothing is published.

Existing songs are not overwritten. An exact file hash or an existing same-title song in the same album is treated as a duplicate.

### Artwork

Name the artwork after the release, for example:

- `Dead Flowers Still Bloom.jpg`
- `dead-flowers-still-bloom.png`
- `dead_flowers_still_bloom-cover.jpg`

The release is matched by normalized title/slug. The image is uploaded to R2 and `albums.cover_art_path` is updated to an `r2:` path. Existing Supabase artwork remains valid.

### Videos

Drop an MP4 into `videos/`. The embedded title is preferred; otherwise the filename is used. The sync matches it to an existing song, uploads it to R2, and creates a published `lyric_videos` row. Ambiguous videos go to `_review/videos/`.

## Run

From this directory:

```
npm install
npm run setup
npm run watch
```

Leave the watcher running while you work. It processes files after Windows finishes copying them.

Use `npm run scan` for a one-time scan instead.

## Safe behavior

- Existing Supabase-backed media is not modified by the sync.
- New R2 media is referenced with an `r2:` prefix.
- Duplicate files are archived instead of re-imported.
- Ambiguous files are placed in `_review/`.
- R2 uploads are removed if the corresponding database insert fails.
- A `media_ingest` record is created for processed, duplicate, review, and failed imports.
