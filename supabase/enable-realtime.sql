-- Enable Realtime for game tables
-- Jalankan ini di Supabase Dashboard → SQL Editor → New query → Run

-- Drop existing publications if any
DROP PUBLICATION IF EXISTS supabase_realtime;

-- Create new publication with game tables
CREATE PUBLICATION supabase_realtime FOR TABLE 
  public.game_sessions,
  public.game_players,
  public.game_answers;

-- Verify
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
