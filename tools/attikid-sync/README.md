# ATTIKID Media Sync

A local Windows media drop-zone for the ATTIKID site.

## Folders

The default root is `%USERPROFILE%\\ATTIKID-MEDIA`:

```
ATTIKID-MEDIA/
  music/
  albums/
    Dead Flowers Still Bloom/
      config.txt
      cover.jpg
      01-song.mp3
      02-song.mp3
    Trauma & Shit/
      config.txt
      cover.jpg
      01-song.mp3
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

The `albums/<Release Name>/` directory is the release source directory. Put the release's `config.txt`, tracks, and release artwork there. The watcher reads that directory and publishes the actual media objects to the matching R2 bucket while keeping the catalog metadata in Supabase.

The older top-level `music/` and `artwork/` drop-zones remain supported for simple imports.

## Release config

Each release directory can contain a `config.txt` using this format:

```
- Title: Dead Flowers Still Bloom
- Artist: ATTIKID
- Released: 2026
- No. of tracks: 10
- PURPOSE - A record about ...

- Details:
    Title: Dead Flowers Still Bloom
    Artist: ATTIKID
    Release Date: 2026
    Genre: Alternative Rap
    AI platform: Suno
```

The sync uses:

- `Title` to identify the release.
- `Artist` and `Released` as catalog fallbacks.
- `No. of tracks` as release metadata.
- `PURPOSE` as the album purpose displayed in the album carousel.
- `Genre` and `AI platform` as release-level credit metadata.

For tracks inside a release directory, MP3/other supported audio metadata remains the source of truth for title, artist, track number, embedded album, release/year, duration, and other ID3 fields. The config fills gaps and supplies release-level purpose/credits.

## Credentials

Copy `.env.example` to `.env` and fill in:

- Supabase project URL
- Supabase secret/service-role key
- Cloudflare R2 account ID
- R2 access key
- R2 secret key
- R2 bucket names

The secret keys are used only by this local Node process. Never put `.env` in Git.

## Storage

Create these R2 buckets:

- `attikid-audio`
- `attikid-artwork`
- `attikid-videos`

The browser-side base URLs go in Vercel as:

```
VITE_R2_AUDIO_PUBLIC_BASE_URL=
VITE_R2_ARTWORK_PUBLIC_BASE_URL=
VITE_R2_VIDEO_PUBLIC_BASE_URL=
```

## Database

Run the Supabase migrations in the main repo:

- `018_media_ingest.sql`
- `019_lyric_videos.sql`
- `020_media_triggers.sql`
- `021_catalog_metadata.sql`

## What importing does

### Release directories

When a `config.txt` appears or changes, the sync creates/updates the matching album row and stores its purpose and release-level metadata.

### Music

Drop an MP3 into a release directory or `music/`.

The sync reads ID3 metadata:

- title
- artist
- album
- track number
- release/year
- duration

A release-directory `config.txt` is used when a matching config exists. Tracks without an album/config are treated as standalone singles with a nullable `album_id`.

### Artwork

Release artwork can live inside its release directory or in the top-level `artwork/` folder. Release artwork updates `albums.cover_art_path`. Artwork matched to a standalone single updates `songs.artwork_path`.

### Videos

Drop an MP4 into `videos/`. The embedded title is preferred; otherwise the filename is used. The sync matches it to an existing song, uploads it to R2, and creates a published `lyric_videos` row. Ambiguous videos go to `_review/videos/`.

## Run

From the repo:

```
cd tools/attikid-sync
npm install
npm run setup
npm run watch
```

Leave the watcher running while you work. It processes files after Windows finishes copying them.

Use `npm run scan` for a one-time scan instead.

## Safe behavior

- Existing Supabase-backed media is not modified unless the new import explicitly updates its catalog record.
- New R2 media is referenced with an `r2:` prefix.
- Duplicate files are archived instead of re-imported.
- Ambiguous files are placed in `_review/`.
- R2 uploads are removed if the corresponding database insert fails.
- A `media_ingest` record is created for processed, duplicate, review, and failed imports.
