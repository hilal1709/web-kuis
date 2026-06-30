-- ============================================================
-- QUIZORAMA — Skema Database (Supabase / PostgreSQL)
-- Jalankan seluruh file ini di Supabase Dashboard -> SQL Editor -> New query -> Run
-- ============================================================

-- Bersihkan (aman dijalankan ulang saat development)
drop table if exists public.game_answers cascade;
drop table if exists public.game_players cascade;
drop table if exists public.game_sessions cascade;
drop table if exists public.attempts cascade;
drop table if exists public.options cascade;
drop table if exists public.questions cascade;
drop table if exists public.quizzes cascade;
drop table if exists public.categories cascade;
drop table if exists public.profiles cascade;

-- ------------------------------------------------------------
-- PROFILES — 1:1 dengan auth.users
-- ------------------------------------------------------------
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  username    text not null,
  avatar_url  text,
  created_at  timestamptz not null default now()
);

-- ------------------------------------------------------------
-- CATEGORIES
-- ------------------------------------------------------------
create table public.categories (
  id    uuid primary key default gen_random_uuid(),
  name  text not null,
  slug  text not null unique,
  icon  text not null default 'category'  -- nama Material Symbol
);

-- ------------------------------------------------------------
-- QUIZZES
-- ------------------------------------------------------------
create table public.quizzes (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  description  text,
  category_id  uuid references public.categories (id) on delete set null,
  cover_image  text,
  plays_count  integer not null default 0,
  is_public    boolean not null default false,
  created_by   uuid references public.profiles (id) on delete set null,
  created_at   timestamptz not null default now()
);

-- ------------------------------------------------------------
-- QUESTIONS
-- ------------------------------------------------------------
create table public.questions (
  id            uuid primary key default gen_random_uuid(),
  quiz_id       uuid not null references public.quizzes (id) on delete cascade,
  question_text text not null,
  image_url     text,
  position      integer not null default 0,
  time_limit    integer not null default 20  -- detik
);

-- ------------------------------------------------------------
-- OPTIONS (pilihan jawaban)
-- ------------------------------------------------------------
create table public.options (
  id           uuid primary key default gen_random_uuid(),
  question_id  uuid not null references public.questions (id) on delete cascade,
  option_text  text not null,
  is_correct   boolean not null default false,
  position     integer not null default 0
);

-- ------------------------------------------------------------
-- ATTEMPTS (skor / riwayat main) — sumber papan peringkat
-- ------------------------------------------------------------
create table public.attempts (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.profiles (id) on delete cascade,
  quiz_id        uuid not null references public.quizzes (id) on delete cascade,
  score          integer not null default 0,
  correct_count  integer not null default 0,
  total_count    integer not null default 0,
  time_taken     integer not null default 0,  -- detik
  created_at     timestamptz not null default now()
);

create index attempts_quiz_score_idx on public.attempts (quiz_id, score desc);
create index questions_quiz_idx on public.questions (quiz_id, position);
create index options_question_idx on public.options (question_id, position);

-- ------------------------------------------------------------
-- GAME SESSIONS — Sesi permainan live
-- ------------------------------------------------------------
create table public.game_sessions (
  id           uuid primary key default gen_random_uuid(),
  quiz_id      uuid not null references public.quizzes (id) on delete cascade,
  owner_id     uuid not null references public.profiles (id) on delete cascade,
  status       text not null default 'waiting', -- 'waiting', 'active', 'completed'
  min_players  integer not null default 2,
  current_question integer default 0,
  created_at   timestamptz not null default now(),
  started_at   timestamptz,
  ended_at     timestamptz
);

-- ------------------------------------------------------------
-- GAME PLAYERS — Pemain yang join ke sesi game
-- ------------------------------------------------------------
create table public.game_players (
  id           uuid primary key default gen_random_uuid(),
  game_session_id uuid not null references public.game_sessions (id) on delete cascade,
  user_id      uuid not null references public.profiles (id) on delete cascade,
  score        integer not null default 0,
  correct_count integer not null default 0,
  joined_at    timestamptz not null default now(),
  finished_at  timestamptz,
  unique(game_session_id, user_id)
);

-- ------------------------------------------------------------
-- GAME ANSWERS — Jawaban pemain per pertanyaan
-- ------------------------------------------------------------
create table public.game_answers (
  id           uuid primary key default gen_random_uuid(),
  game_player_id uuid not null references public.game_players (id) on delete cascade,
  question_id  uuid not null references public.questions (id) on delete cascade,
  option_id    uuid references public.options (id) on delete set null,
  is_correct   boolean not null default false,
  time_taken   integer not null default 0, -- detik
  answered_at  timestamptz not null default now()
);

create index game_sessions_quiz_idx on public.game_sessions (quiz_id, status);
create index game_players_session_idx on public.game_players (game_session_id, score desc);
create index game_answers_player_idx on public.game_answers (game_player_id, question_id);

-- ------------------------------------------------------------
-- Auto-buat profile saat user baru daftar
-- ------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------------------
-- Tambah plays_count secara atomik
-- ------------------------------------------------------------
create or replace function public.increment_plays(quiz uuid)
returns void
language sql
as $$
  update public.quizzes set plays_count = plays_count + 1 where id = quiz;
$$;

-- ------------------------------------------------------------
-- Tambah skor game player secara atomik
-- ------------------------------------------------------------
create or replace function public.increment_game_score(game_player_id uuid, points integer)
returns void
language sql
as $$
  update public.game_players set score = score + points, correct_count = correct_count + 1 where id = game_player_id;
$$;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.profiles   enable row level security;
alter table public.categories enable row level security;
alter table public.quizzes    enable row level security;
alter table public.questions  enable row level security;
alter table public.options    enable row level security;
alter table public.attempts   enable row level security;
alter table public.game_sessions enable row level security;
alter table public.game_players enable row level security;
alter table public.game_answers enable row level security;

-- Konten kuis: bisa dibaca siapa saja (termasuk anon)
create policy "categories readable" on public.categories for select using (true);
create policy "quizzes readable"    on public.quizzes    for select using (true);
create policy "questions readable"  on public.questions  for select using (true);
create policy "options readable"    on public.options    for select using (true);

-- Profiles: semua bisa baca (untuk papan peringkat), hanya pemilik bisa ubah
create policy "profiles readable"      on public.profiles for select using (true);
create policy "profiles update own"    on public.profiles for update using (auth.uid() = id);
create policy "profiles insert own"    on public.profiles for insert with check (auth.uid() = id);

-- Quizzes: user login bisa membuat kuis sendiri
create policy "quizzes insert own" on public.quizzes
  for insert with check (auth.uid() = created_by);
create policy "quizzes update own" on public.quizzes
  for update using (auth.uid() = created_by);

-- Attempts: semua bisa baca (papan peringkat), user hanya bisa menulis miliknya
create policy "attempts readable"   on public.attempts for select using (true);
create policy "attempts insert own" on public.attempts
  for insert with check (auth.uid() = user_id);

-- Data demo opsional: jalankan supabase/seed.sql terpisah jika perlu.

-- Kebijakan buat kuis (user login)
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

-- Game Sessions: semua bisa baca, owner bisa insert/update own
create policy "game_sessions readable" on public.game_sessions for select using (true);
create policy "game_sessions insert own" on public.game_sessions
  for insert with check (auth.uid() = owner_id);
create policy "game_sessions update own" on public.game_sessions
  for update using (auth.uid() = owner_id);

-- Game Players: semua bisa baca, user bisa insert own, owner bisa update
create policy "game_players readable" on public.game_players for select using (true);
create policy "game_players insert own" on public.game_players
  for insert with check (auth.uid() = user_id);
create policy "game_players update owner" on public.game_players
  for update using (
    auth.uid() = user_id or
    exists (
      select 1 from public.game_sessions gs
      where gs.id = game_session_id and gs.owner_id = auth.uid()
    )
  );

-- Game Answers: semua bisa baca, user bisa insert own
create policy "game_answers readable" on public.game_answers for select using (true);
create policy "game_answers insert own" on public.game_answers
  for insert with check (
    exists (
      select 1 from public.game_players gp
      where gp.id = game_player_id and gp.user_id = auth.uid()
    )
  );
