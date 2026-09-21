create table if not exists public.media_ingest (
  id uuid primary key default gen_random_uuid(),
  file_hash text not null unique,
  source_name text not null,
  media_type text not null check (media_type in ('audio','artwork','video')),
  status text not null check (status in ('processed','duplicate','review_required','failed')),
  album_id uuid references public.albums(id) on delete set null,
  song_id uuid references public.songs(id) on delete set null,
  storage_bucket text,
  storage_path text,
  metadata jsonb,
  error text,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.media_ingest enable row level security;

create index if not exists media_ingest_status_idx on public.media_ingest(status);
create index if not exists media_ingest_created_idx on public.media_ingest(created_at desc);
create index if not exists media_ingest_song_idx on public.media_ingest(song_id);
create index if not exists media_ingest_album_idx on public.media_ingest(album_id);
