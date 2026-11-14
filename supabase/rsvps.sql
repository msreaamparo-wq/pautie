-- Run this ONCE in Supabase: SQL Editor -> New query -> paste -> Run.
-- Guests can only ADD an RSVP (insert). They can never read, edit or delete.
-- You (the family) read the answers in: Table Editor -> rsvps.

create table if not exists public.rsvps (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  name        text not null check (char_length(btrim(name)) between 1 and 100),
  attending   boolean not null,
  guests      integer not null check (guests between 0 and 20),
  message     text check (message is null or char_length(message) <= 500)
);

alter table public.rsvps enable row level security;

drop policy if exists "Guests can submit an RSVP" on public.rsvps;
create policy "Guests can submit an RSVP"
  on public.rsvps
  for insert
  to anon, authenticated
  with check (true);

grant insert on public.rsvps to anon, authenticated;
