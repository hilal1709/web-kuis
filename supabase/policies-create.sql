-- Kebijakan RLS agar user login bisa buat kuis lengkap (kategori, pertanyaan, opsi)
-- Jalankan sekali di SQL Editor atau: node scripts/apply-create-policies.mjs

create policy "categories insert auth" on public.categories
  for insert to authenticated with check (true);

create policy "questions insert own quiz" on public.questions
  for insert with check (
    exists (
      select 1 from public.quizzes q
      where q.id = quiz_id and q.created_by = auth.uid()
    )
  );

create policy "questions update own quiz" on public.questions
  for update using (
    exists (
      select 1 from public.quizzes q
      where q.id = quiz_id and q.created_by = auth.uid()
    )
  );

create policy "options insert own quiz" on public.options
  for insert with check (
    exists (
      select 1 from public.questions qu
      join public.quizzes q on q.id = qu.quiz_id
      where qu.id = question_id and q.created_by = auth.uid()
    )
  );

create policy "options update own quiz" on public.options
  for update using (
    exists (
      select 1 from public.questions qu
      join public.quizzes q on q.id = qu.quiz_id
      where qu.id = question_id and q.created_by = auth.uid()
    )
  );
