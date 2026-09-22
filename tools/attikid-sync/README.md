# ATTIKID Media Sync

A local Windows media drop-zone for the ATTIKID site.

## Folders

The default root is `%USERPROFILE%\\attikid-media`:

```
attikid-media/
└── albums/
    ├── Dead Flowers Still Bloom/
    │   ├── config.json
    │   ├── cover.webp
    │   ├── 01-song.mp3
    │   └── ...
    ├── Trauma & Shit/
    │   ├── config.json
    │   ├── cover.webp
    │   └── ...
    ├── Misery Motel/
    │   ├── config.json
    │   ├── cover.webp
    │   └── ...
    ├── More Trauma & Shit/
    │   ├── config.json
    │   ├── cover.webp
    │   └── ...
    ├── Cloudy With A Chance/
    │   ├── config.json
    │   ├── cover.webp
    │   └── ...
    └── Singles/
        ├── config.json
        └── ...
```

The `albums/<Release Name>/` directory is the release source directory. `albums/Singles/` is reserved for standalone tracks and does not create a database album; its `config.json` supplies optional defaults for those singles. Put the release's `config.json`, tracks, and release artwork there. The watcher reads that directory and publishes the actual media objects to the matching R2 bucket while keeping the catalog metadata in Supabase.

The older top-level `music/` and `artwork/` drop-zones remain supported for simple imports.

## Release config

Each release directory must contain a `config.json` using this format:

```json
{
  "title": "Dead Flowers Still Bloom",
  "artist": "Attikid",
  "released": 2026,
  "no_of_tracks": 10,
  "purpose": "A description of why the album was made and the songs within."
}
```

The sync uses:

- `title` to identify the release.
- `artist` as the release artist.
- `released` as the release year.
- `no_of_tracks` as the expected release track count.
- `purpose` as the album purpose displayed in the album carousel.

The config is release-level metadata only. Individual audio files remain the source of truth for song title, artist, track number, embedded album, release/year, duration, genre, and other ID3 metadata.

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

When an album `config.json` appears or changes, the sync creates/updates the matching album row and stores its title, artist, release year, expected track count, and purpose. `albums/Singles/config.json` is treated as the standalone-singles catalog config and does not create a `Singles` album.

### Music

Drop an MP3 into an album release directory, `albums/Singles/`, or the top-level `music/` drop-zone.

The sync reads ID3 metadata:

- title
- artist
- album
- track number
- release/year
- duration

An album release-directory `config.json` is used when a matching config exists. Tracks inside `albums/Singles/` are always treated as standalone singles with a nullable `album_id`, even when `config.json` is present.

### Artwork

Release artwork can live inside its release directory or in the top-level `artwork/` folder. The standard release artwork filename is `cover.webp`. Release artwork updates `albums.cover_art_path`. Artwork matched to a standalone single updates `songs.artwork_path`.

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
