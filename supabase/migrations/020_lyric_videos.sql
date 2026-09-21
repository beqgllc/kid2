create table if not exists public.lyric_videos (
  id uuid primary key default gen_random_uuid(),

  song_id uuid not null
    references public.songs(id)
    on delete cascade,

  title text not null,

  video_path text not null unique,

  video_mime_type text not null
    default 'video/mp4',

  file_size bigint,

  duration_seconds numeric,

  thumbnail_path text,

  published boolean not null default true,

  created_at timestamptz not null
    default timezone('utc', now()),

  updated_at timestamptz not null
    default timezone('utc', now())
);

alter table public.lyric_videos
enable row level security;

create index if not exists lyric_videos_song_idx
on public.lyric_videos(song_id);

create index if not exists lyric_videos_published_idx
on public.lyric_videos(published);

create index if not exists lyric_videos_created_idx
on public.lyric_videos(created_at desc);

create policy lyric_videos_public_read
on public.lyric_videos
for select
to anon, authenticated
using (published = true);

create policy lyric_videos_admin_insert
on public.lyric_videos
for insert
to authenticated
with check (public.is_admin());

create policy lyric_videos_admin_update
on public.lyric_videos
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy lyric_videos_admin_delete
on public.lyric_videos
for delete
to authenticated
using (public.is_admin());

grant select
on table public.lyric_videos
to anon, authenticated;

grant insert, update, delete
on table public.lyric_videos
to authenticated;

grant all
on table public.lyric_videos
to service_role;
