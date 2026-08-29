create table if not exists public.reactions (
  id uuid primary key default gen_random_uuid(),
  song_id uuid not null references public.songs(id) on delete cascade,
  visitor_id uuid not null references auth.users(id) on delete cascade,
  reaction text not null check (reaction in ('like','dislike')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique(song_id, visitor_id)
);
alter table public.reactions enable row level security;
