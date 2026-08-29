create table if not exists public.fan_mail (
  id uuid primary key default gen_random_uuid(),
  sender_name text,
  sender_email text,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);
alter table public.fan_mail enable row level security;
create index if not exists fan_mail_created_idx on public.fan_mail(created_at desc);
create index if not exists fan_mail_unread_idx on public.fan_mail(is_read, created_at desc);
