-- Tambahkan kolom plays_incremented ke tabel game_players
alter table public.game_players add column if not exists plays_incremented boolean not null default false;
