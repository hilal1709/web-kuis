-- Tambahkan kolom is_public ke tabel quizzes
alter table public.quizzes add column if not exists is_public boolean not null default false;

-- Update policies untuk quizzes
drop policy if exists "quizzes readable" on public.quizzes;

-- Quizzes bisa dibaca:
-- - Semua orang jika is_public = true
-- - Hanya pemilik jika is_public = false
create policy "quizzes readable" on public.quizzes
  for select using (
    is_public = true or
    auth.uid() = created_by
  );

-- Quizzes bisa di-update oleh pemilik
drop policy if exists "quizzes update own" on public.quizzes;
create policy "quizzes update own" on public.quizzes
  for update using (auth.uid() = created_by);
