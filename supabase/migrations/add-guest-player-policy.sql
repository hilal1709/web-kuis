-- Tambahkan policy untuk memungkinkan guest (user anon) menambah pemain ke game_players dan submit jawaban
DROP POLICY IF EXISTS "game_players_insert_own" ON public.game_players;
DROP POLICY IF EXISTS "game_players_select_own" ON public.game_players;
DROP POLICY IF EXISTS "game_answers insert own" ON public.game_answers;
DROP POLICY IF EXISTS "game_answers select own" ON public.game_answers;
DROP POLICY IF EXISTS "game_answers_insert" ON public.game_answers;
DROP POLICY IF EXISTS "game_players_insert" ON public.game_players;

-- Policy untuk select game_players: semua orang bisa melihat (untuk realtime dan halaman waiting room)
CREATE POLICY "game_players_select" ON public.game_players FOR SELECT
USING (true);

-- Policy untuk insert game_players:
-- 1. User yang login bisa insert untuk dirinya sendiri (user_id = auth.uid())
-- 2. User anon bisa insert dengan guest_username (tidak butuh user_id)
CREATE POLICY "game_players_insert" ON public.game_players FOR INSERT
WITH CHECK (
  (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
  (auth.uid() IS NULL AND guest_username IS NOT NULL)
);

-- Policy untuk select game_answers: semua orang bisa melihat
CREATE POLICY "game_answers_select" ON public.game_answers FOR SELECT
USING (true);

-- Policy untuk insert game_answers:
-- 1. User yang login bisa insert untuk dirinya sendiri (game_player_id punya user_id = auth.uid())
-- 2. User anon bisa insert jika game_player_id punya guest_username (karena tidak ada user_id untuk verifikasi)
CREATE POLICY "game_answers_insert" ON public.game_answers FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.game_players gp
    WHERE gp.id = game_player_id AND
      (gp.user_id = auth.uid() OR gp.guest_username IS NOT NULL)
  )
);
