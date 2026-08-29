create table if not exists public.albums (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  artist_name text not null,
  release_date date not null,
  slug text not null unique,
  description text,
  cover_art_path text,
  is_featured boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);
alter table public.albums enable row level security;
