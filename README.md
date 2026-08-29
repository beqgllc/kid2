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
- Admin authentication
- Admin catalog editing
- Individual + bulk audio uploads (up to 50 files)
- Song / album analytics
- Animated splash, loading states, transitions, hover and scroll effects
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

Create these Storage buckets:

- `attikid-audio`
- `attikid-artwork`
- `attikid-assets`

Apply the Storage policies from `supabase/migrations/015_storage.sql`.

## 3. Create the administrator

Create an email/password user in Supabase Auth matching `VITE_ADMIN_EMAIL`. Then insert/update the corresponding `profiles` row with `role = 'admin'` as permitted by the migration.

The originally requested `admin / attikid` login should be treated as an initial bootstrap credential only. Do not hard-code that password into the frontend or commit it to source control. Supabase Auth is the authority for the administrator account.

The login screen accepts `admin` as a convenience username and maps it to `VITE_ADMIN_EMAIL`.

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
