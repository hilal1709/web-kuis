-- Ubah fungsi increment_plays menjadi security definer agar bisa mengupdate plays_count meskipun user bukan pemilik kuis
create or replace function public.increment_plays(quiz uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.quizzes set plays_count = plays_count + 1 where id = quiz;
end;
$$;
