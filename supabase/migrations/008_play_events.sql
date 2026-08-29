create table if not exists public.play_events (
  id uuid primary key default gen_random_uuid(),
  song_id uuid not null references public.songs(id) on delete set null,
  visitor_id uuid references auth.users(id) on delete set null,
  session_id text,
  started_at timestamptz not null default timezone('utc', now())
);
alter table public.play_events enable row level security;
create index if not exists play_events_song_idx on public.play_events(song_id);
create index if not exists play_events_started_idx on public.play_events(started_at desc);
