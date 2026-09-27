# ATTIKID

A responsive music portfolio + lightweight artist CMS powered by React, Vite, TypeScript and Supabase.

## Features

- Responsive public artist portfolio
- Persistent global music player
- Album and song catalog
- Lyrics A–Z directory
- Likes / dislikes
- Anonymous comments
- Fan mail inbox
-  authentication
- Admin catalog editing
- Admin visual archive (lyric-video upload/edit/publish/delete)
- Admin comment moderation
- Live Analog Room audio level meter
- Individual + bulk audio uploads (up to 50 files)
- Song / album analytics
- Loading states, transitions, hover and scroll effects
- Custom 404

## 1. Install

```bash
npm install
```

## 2. Configure Supabase

Copy `.env.example` to `.env.local` and fill in:

```text
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_ADMIN_EMAIL=
```

Run the SQL migrations in `supabase/migrations/` in order.

## Add lyrics

Lyrics are stored in Supabase and linked to a song by `song_id`. There are two supported workflows:

### Admin console

1. Sign in at `/admin/login` with the Supabase Auth user whose profile has `role = 'admin'`.
2. Open **Lyrics**, select a song, paste the lyrics with their intended line breaks, and choose **Save lyrics**.

The admin console creates the lyrics row when none exists and updates it when one already exists. The public lyrics pages read the saved content immediately.

### VS Code or GitHub

Use [`supabase/seed/lyrics.sql`](supabase/seed/lyrics.sql) as the repo-managed source. Copy its insert block for each song, replace `replace-with-song-slug` with the exact `songs.slug`, and replace the sample text. Keep the dollar-quoted block (`$$ ... $$`) so apostrophes in lyrics do not need SQL escaping.

Run the file in the Supabase SQL Editor, or with the Supabase CLI against the target project. Run it after the songs have been created. The `on conflict` clause makes rerunning it update existing lyrics rather than create duplicates.

GitHub edits do not automatically change the live database. They become live only when the SQL file is executed against the project. Do not put a Supabase service-role key in the frontend, GitHub, or `.env` variables beginning with `VITE_`.

Create these Storage buckets:

- `attikid-audio`
- `attikid-artwork`
- `attikid-assets`
- `attikid-videos`

Apply the Storage policies from `supabase/migrations/015_storage.sql`.

## 3. Create the administrator

Create an email/password user in Supabase Auth matching `VITE_ADMIN_EMAIL`. Then insert/update the corresponding `profiles` row with `role = 'admin'` as permitted by the migration.

The originally requested `admin / attikid` login should be treated as an initial bootstrap credential only. Do not hard-code that password into the frontend or commit it to source control. Supabase Auth is the authority for the administrator account.

The login screen accepts `attikidllc` as a convenience username and maps it to `VITE_ADMIN_EMAIL`.

## 4. Run

```bash
npm run dev
```

## 5. Build

```bash
npm run build
```

## Notes

Anonymous Auth is used for low-friction public interactions. Production deployments should enable CAPTCHA / additional abuse controls on anonymous sign-in and public write endpoints as appropriate.


## Production deployment

### Vercel

This repository includes `vercel.json` for Vite SPA routing, immutable asset caching, image caching, and baseline security headers.

Set these Vercel environment variables for **Production**, **Preview**, and **Development** as needed:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_ADMIN_EMAIL`
- `VITE_R2_AUDIO_PUBLIC_BASE_URL` (optional)
- `VITE_R2_ARTWORK_PUBLIC_BASE_URL` (optional)
- `VITE_R2_VIDEO_PUBLIC_BASE_URL` (optional)

Never expose a Supabase service-role key or Cloudflare secret in a `VITE_` variable.

### Supabase production checklist

1. Run every migration in `supabase/migrations/` in filename order.
2. Confirm the `attikid-audio`, `attikid-artwork`, `attikid-assets`, and `attikid-videos` buckets exist and are public-read.
3. Confirm the admin user's `profiles.role` is `admin`.
4. Confirm RLS policies are enabled.
5. Configure CAPTCHA/abuse controls for anonymous public writes.
6. If R2 is used, configure CORS to allow the production ATTIKID origin and send `GET`, `HEAD`, and `OPTIONS`.
7. Test a song upload, replacement, playback, comment moderation, video upload, and video deletion from the production admin console.

### Admin CMS map

- `/admin` — overview and totals
- `/admin/music` — upload, edit, replace audio, delete songs
- `/admin/albums` — album metadata, artwork, track ordering
- `/admin/lyrics` — lyrics editor
- `/admin/videos` — lyric-video upload, publish/draft, edit, delete
- `/admin/comments` — search, edit, delete public comments
- `/admin/analytics` — song and album performance
- `/admin/fan-mail` — community inbox
- `/admin/settings` — environment/configuration notes
