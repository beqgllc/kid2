-- Remove duplicate song records created by repeated catalog ingestion.
-- The newest record for each normalized title is treated as canonical.

DO $$
DECLARE
  pair RECORD;
  keep_has_lyrics boolean;
  remove_has_lyrics boolean;
BEGIN
  FOR pair IN
    WITH normalized AS (
      SELECT
        id,
        created_at,
        lower(trim(regexp_replace(replace(title, '&', 'and'), '[^a-zA-Z0-9]+', ' ', 'g'))) AS normalized_title,
        row_number() OVER (
          PARTITION BY lower(trim(regexp_replace(replace(title, '&', 'and'), '[^a-zA-Z0-9]+', ' ', 'g')))
          ORDER BY created_at DESC, id DESC
        ) AS rn
      FROM public.songs
    )
    SELECT keep.id AS keep_id, remove.id AS remove_id
    FROM normalized keep
    JOIN normalized remove
      ON remove.normalized_title = keep.normalized_title
     AND remove.rn > 1
    WHERE keep.rn = 1
  LOOP
    SELECT EXISTS(SELECT 1 FROM public.lyrics WHERE song_id = pair.keep_id)
      INTO keep_has_lyrics;

    SELECT EXISTS(SELECT 1 FROM public.lyrics WHERE song_id = pair.remove_id)
      INTO remove_has_lyrics;

    IF remove_has_lyrics AND NOT keep_has_lyrics THEN
      UPDATE public.lyrics
      SET song_id = pair.keep_id, updated_at = timezone('utc', now())
      WHERE song_id = pair.remove_id;
    ELSE
      DELETE FROM public.lyrics
      WHERE song_id = pair.remove_id;
    END IF;

    UPDATE public.play_events
    SET song_id = pair.keep_id
    WHERE song_id = pair.remove_id;

    UPDATE public.media_ingest
    SET song_id = pair.keep_id
    WHERE song_id = pair.remove_id;

    UPDATE public.songs keep_song
    SET
      artwork_path = COALESCE(keep_song.artwork_path, remove_song.artwork_path),
      is_featured = keep_song.is_featured OR remove_song.is_featured
    FROM public.songs remove_song
    WHERE keep_song.id = pair.keep_id
      AND remove_song.id = pair.remove_id;

    DELETE FROM public.songs
    WHERE id = pair.remove_id;
  END LOOP;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS songs_normalized_title_unique_idx
ON public.songs (
  lower(trim(regexp_replace(replace(title, '&', 'and'), '[^a-zA-Z0-9]+', ' ', 'g')))
);
