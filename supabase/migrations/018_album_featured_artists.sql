alter table public.albums
  add column if not exists featured_artists text;
