-- Add is_public column to quizzes table
ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT false;
