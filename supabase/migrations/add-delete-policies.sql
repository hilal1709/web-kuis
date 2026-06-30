-- Tambahkan kebijakan DELETE untuk semua tabel yang dibutuhkan

-- Quizzes: hanya owner yang bisa menghapus
drop policy if exists "quizzes delete own" on public.quizzes;
create policy "quizzes delete own" on public.quizzes
  for delete using (auth.uid() = created_by);

-- Questions: hanya owner quiz yang bisa menghapus
drop policy if exists "questions delete own quiz" on public.questions;
create policy "questions delete own quiz" on public.questions
  for delete using (
    exists (
      select 1 from public.quizzes q
      where q.id = quiz_id and q.created_by = auth.uid()
    )
  );

-- Options: hanya owner quiz yang bisa menghapus
drop policy if exists "options delete own quiz" on public.options;
create policy "options delete own quiz" on public.options
  for delete using (
    exists (
      select 1 from public.questions qu
      join public.quizzes q on q.id = qu.quiz_id
      where qu.id = question_id and q.created_by = auth.uid()
    )
  );

-- Game Sessions: hanya owner yang bisa menghapus
drop policy if exists "game_sessions delete own" on public.game_sessions;
create policy "game_sessions delete own" on public.game_sessions
  for delete using (auth.uid() = owner_id);

-- Game Players: owner session atau user sendiri yang bisa menghapus
drop policy if exists "game_players delete own" on public.game_players;
create policy "game_players delete own" on public.game_players
  for delete using (
    auth.uid() = user_id or
    exists (
      select 1 from public.game_sessions gs
      where gs.id = game_session_id and gs.owner_id = auth.uid()
    )
  );

-- Game Answers: hanya user sendiri atau owner session yang bisa menghapus
drop policy if exists "game_answers delete own" on public.game_answers;
create policy "game_answers delete own" on public.game_answers
  for delete using (
    exists (
      select 1 from public.game_players gp
      where gp.id = game_player_id and (
        gp.user_id = auth.uid() or
        exists (
          select 1 from public.game_sessions gs
          where gs.id = gp.game_session_id and gs.owner_id = auth.uid()
        )
      )
    )
  );

-- Attempts: hanya user sendiri yang bisa menghapus
drop policy if exists "attempts delete own" on public.attempts;
create policy "attempts delete own" on public.attempts
  for delete using (auth.uid() = user_id);
