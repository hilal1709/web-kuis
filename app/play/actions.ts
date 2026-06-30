"use server";

import { createClient } from "@/lib/supabase/server";

export type SaveAttemptInput = {
  quizId: string;
  score: number;
  correctCount: number;
  totalCount: number;
  timeTaken: number;
};

// Simpan hasil main, tambah plays_count, kembalikan id attempt untuk halaman hasil.
export async function saveAttempt(input: SaveAttemptInput): Promise<
  | { ok: true; attemptId: string }
  | { ok: false; error: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: "Harus login dulu." };

  const { data, error } = await supabase
    .from("attempts")
    .insert({
      user_id: user.id,
      quiz_id: input.quizId,
      score: input.score,
      correct_count: input.correctCount,
      total_count: input.totalCount,
      time_taken: input.timeTaken,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { ok: false, error: error?.message ?? "Gagal menyimpan hasil." };
  }

  // Tambah jumlah dimainkan (best-effort)
  await supabase.rpc("increment_plays", { quiz: input.quizId });

  return { ok: true, attemptId: data.id };
}
