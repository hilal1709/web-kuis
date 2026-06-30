-- Tambahkan kolom hidden ke tabel game_sessions
alter table public.game_sessions add column if not exists hidden boolean not null default false;

-- Tambahkan policy untuk update hidden (hanya owner yang bisa menyembunyikan game)
drop policy if exists "game_sessions update own" on public.game_sessions;
create policy "game_sessions update own" on public.game_sessions
  for update using (auth.uid() = owner_id);
