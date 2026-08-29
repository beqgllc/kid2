do $$
declare t text;
begin
  foreach t in array array['profiles','albums','songs','lyrics','reactions','comments','fan_mail'] loop
    execute format('drop trigger if exists %I on public.%I', 'touch_'||t, t);
    execute format('create trigger %I before update on public.%I for each row execute procedure public.touch_updated_at()', 'touch_'||t, t);
  end loop;
end $$;
