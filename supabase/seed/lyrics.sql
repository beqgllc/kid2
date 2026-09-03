-- Repo-managed lyrics. Run this after the matching songs exist in public.songs.
-- Keep one block per song and use the song slug from public.songs.

insert into public.lyrics (song_id, content)
select id, $$
Paste the lyrics for this song here.
Keep line breaks exactly as they should appear on the public lyrics page.
$$
from public.songs
where slug = 'replace-with-song-slug'
on conflict (song_id) do update
set content = excluded.content,
    updated_at = timezone('utc', now());