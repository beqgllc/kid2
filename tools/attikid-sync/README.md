# ATTIKID Media Sync

A local Windows-friendly media drop-zone for the ATTIKID site.

## What it does

- Watches `music/`, `artwork/`, and `videos/`.
- Reads MP3/MP4 metadata.
- Matches music to existing releases and songs.
- Uploads new media to Cloudflare R2.
- Writes the corresponding Supabase metadata.
- Never overwrites an existing song when a duplicate title is detected.
- Moves ambiguous files into `_review/` instead of guessing.
- Archives successfully processed files under `_processed/`.
- Records every successful/duplicate/review/failure event in `media_ingest`.

## Setup

1. Create the media folders by running the sync once.
2. Copy `.env.example` to `.env`.
3. Fill in the Supabase secret key and R2 credentials.
4. Create an R2 bucket named `attikid-videos` in addition to the existing `attikid-audio`. Create `attikid-artwork` if you are moving new artwork there.
5. Run:
   `npm install`
6. Run:
   `npm run watch`

The default local folder is:

`C:\Users\<YOU>\ATTIKID-MEDIA`

You can override it with `ATTIKID_MEDIA_ROOT`.

## Drop-zone behavior

### Music

The MP3 album tag is matched to an existing release. The title, artist, track number, duration, and file size are imported automatically.

### Artwork

The filename is matched to the release, for example:

- `Dead Flowers Still Bloom.jpg`
- `dead-flowers-still-bloom.png`
- `dead_flowers_still_bloom-cover.jpg`

A successful artwork import updates that release's `cover_art_path`.

### Videos

The embedded title or filename is matched to a song. A successful MP4 import creates a `lyric_videos` record.

### Review queue

Anything ambiguous goes to:

`_review/music`

`_review/artwork`

`_review/videos`

Nothing is published automatically when the match is ambiguous.

## Security

The sync tool is local-only and uses a Supabase secret key and R2 secret access key. Never put those keys in Vite `VITE_*` variables and never commit `.env`.
