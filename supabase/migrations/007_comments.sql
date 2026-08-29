create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  song_id uuid not null references public.songs(id) on delete cascade,
  visitor_id uuid not null references auth.users(id) on delete cascade,
  display_name text,
  content text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);
alter table public.comments enable row level security;
create index if not exists comments_song_created_idx on public.comments(song_id, created_at desc);
