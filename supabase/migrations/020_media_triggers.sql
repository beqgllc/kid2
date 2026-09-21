drop trigger if exists touch_lyric_videos on public.lyric_videos;
create trigger touch_lyric_videos
before update on public.lyric_videos
for each row execute procedure public.touch_updated_at();
