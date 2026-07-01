-- Fix 1: Izinkan guest (tanpa user_id) menyimpan jawaban.
-- Policy lama hanya mengizinkan jika gp.user_id = auth.uid(),
-- sehingga guest player (user_id IS NULL) selalu gagal insert.
drop policy if exists "game_answers insert own" on public.game_answers;
create policy "game_answers insert own" on public.game_answers
  for insert with check (
    exists (
      select 1 from public.game_players gp
      where gp.id = game_player_id
        and (
          -- user login: pastikan row miliknya
          gp.user_id = auth.uid()
          or
          -- guest: tidak ada user_id, izinkan siapa saja yang punya game_player_id valid
          gp.user_id is null
        )
    )
  );

-- Fix 2: Jadikan increment_game_score SECURITY DEFINER agar RLS tidak
-- memblokir update skor (terutama untuk guest player).
create or replace function public.increment_game_score(game_player_id uuid, points integer)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.game_players
  set score = score + points,
      correct_count = correct_count + 1
  where id = game_player_id;
end;
$$;

-- Fix 3: Izinkan guest menyimpan finished_at (game_players update).
-- Policy lama hanya mengizinkan user_id = auth.uid() atau owner session,
-- sehingga guest tidak bisa update finished_at-nya sendiri.
drop policy if exists "game_players update owner" on public.game_players;
create policy "game_players update owner" on public.game_players
  for update using (
    -- user login: row miliknya
    auth.uid() = user_id
    or
    -- guest: tidak ada user_id, izinkan (identifikasi via game_player_id di client)
    user_id is null
    or
    -- owner sesi game bisa update semua player
    exists (
      select 1 from public.game_sessions gs
      where gs.id = game_session_id and gs.owner_id = auth.uid()
    )
  );
