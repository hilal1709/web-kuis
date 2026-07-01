-- Ubah tabel game_players untuk mendukung pemain guest
-- Pertama, hapus constraint foreign key yang lama (jika ada)
ALTER TABLE public.game_players DROP CONSTRAINT IF EXISTS game_players_user_id_fkey;

-- Ubah kolom user_id menjadi nullable
ALTER TABLE public.game_players ALTER COLUMN user_id DROP NOT NULL;

-- Tambahkan kolom guest_username
ALTER TABLE public.game_players ADD COLUMN IF NOT EXISTS guest_username TEXT;

-- Hapus constraint lama jika ada
ALTER TABLE public.game_players DROP CONSTRAINT IF EXISTS game_players_has_identity;

-- Tambahkan constraint: harus ada user_id atau guest_username (tidak boleh keduanya kosong)
ALTER TABLE public.game_players ADD CONSTRAINT game_players_has_identity CHECK (
  (user_id IS NOT NULL) OR (guest_username IS NOT NULL)
);

-- Tambahkan kembali constraint foreign key dengan on delete set null
ALTER TABLE public.game_players ADD CONSTRAINT game_players_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
