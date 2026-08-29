create table if not exists public.songs (
  id uuid primary key default gen_random_uuid(),
  album_id uuid not null references public.albums(id) on delete restrict,
  title text not null,
  artist_name text not null,
  track_number integer,
  slug text not null unique,
  audio_path text not null,
  audio_mime_type text,
  file_size bigint,
  duration_seconds numeric,
  release_date date,
  is_featured boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint songs_track_positive check (track_number is null or track_number > 0),
  constraint songs_file_size_nonnegative check (file_size is null or file_size >= 0),
  constraint songs_duration_nonnegative check (duration_seconds is null or duration_seconds >= 0)
);
alter table public.songs enable row level security;
create index if not exists songs_album_idx on public.songs(album_id);
create index if not exists songs_release_idx on public.songs(release_date desc);
create index if not exists songs_title_idx on public.songs(title);
