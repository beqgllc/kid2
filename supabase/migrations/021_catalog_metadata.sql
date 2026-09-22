alter table public.songs
  alter column album_id drop not null;

alter table public.songs
  add column if not exists metadata jsonb not null default '{}'::jsonb;

alter table public.songs
  add column if not exists artwork_path text;

alter table public.albums
  add column if not exists metadata jsonb not null default '{}'::jsonb;

create index if not exists songs_album_id_idx
on public.songs(album_id);

create index if not exists songs_release_date_idx
on public.songs(release_date desc);

create index if not exists songs_metadata_gin_idx
on public.songs using gin(metadata);

create index if not exists albums_metadata_gin_idx
on public.albums using gin(metadata);
