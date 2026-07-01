-- ============================================================
-- FIX: Guest tidak bisa masuk ruang tunggu (waiting room)
-- ============================================================
-- Masalah:
--   Migrasi add-guest-players.sql mengarahkan foreign key
--   game_players.user_id ke auth.users(id). Akibatnya PostgREST
--   kehilangan relasi antara game_players dan public.profiles,
--   sehingga SEMUA query ".select('*, profiles(*)')" gagal dengan
--   error PGRST200 ("Could not find a relationship between
--   'game_players' and 'profiles'"). Query gagal -> daftar pemain
--   dianggap kosong -> pemain (termasuk guest) di-redirect balik
--   ke halaman /join dan tidak pernah masuk ruang tunggu.
--
-- Solusi:
--   Arahkan kembali FK user_id ke public.profiles(id). Kolom tetap
--   nullable (untuk guest) dengan ON DELETE SET NULL. profiles.id
--   sendiri sudah mereferensikan auth.users(id), jadi integritas
--   tetap terjaga dan embed profiles kembali berfungsi.
-- ============================================================

ALTER TABLE public.game_players DROP CONSTRAINT IF EXISTS game_players_user_id_fkey;

ALTER TABLE public.game_players
  ADD CONSTRAINT game_players_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles (id) ON DELETE SET NULL;

-- Muat ulang cache skema PostgREST agar relasi baru langsung dikenali
NOTIFY pgrst, 'reload schema';
