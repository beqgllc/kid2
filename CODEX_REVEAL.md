# CODEX // ATTIKID CODE REVEAL

This repository is the generated implementation baseline for the ATTIKID portfolio.

## Public features

- Responsive artist homepage
- Album catalog ordered newest → oldest by release date
- Song catalog and search
- Persistent sitewide audio player
- Album queue playback
- Play / pause / next / previous / seek / volume / mute
- Repeat and shuffle controls
- A–Z lyrics directory
- Individual lyrics pages
- Likes / dislikes backed by anonymous Auth identity
- Anonymous comments
- Fan-mail form
- Custom 404 route
- Splash/loading/scroll-reveal/motion baseline

## Admin features

- Supabase Auth login
- Protected admin routes
- Dashboard totals
- Album management
- Song metadata editing
- Song deletion
- Individual upload
- Bulk upload up to 50 audio files
- Upload progress
- Lyrics editing linked by song UUID
- Fan-mail inbox, mark read/unread, delete
- Song and album analytics

## Actual file tree

See the repository contents in the ZIP. The important runtime structure is:

```text
src/app
src/components
src/pages
src/hooks
src/stores
src/services
src/lib
src/types
src/utils
src/styles
supabase/migrations
supabase/functions
supabase/seed
tests
```

## Important setup note

The administrator credential is intentionally not hard-coded into source. Create the Supabase Auth account with the desired password, set `VITE_ADMIN_EMAIL`, and give that Auth user a `profiles.role` value of `admin` in Supabase.

The login UI accepts `admin` as the username alias and maps it to `VITE_ADMIN_EMAIL`.
