"use server";

import { createClient } from "@/lib/supabase/server";

export type CreateGameSessionInput = {
  quizId: string;
  minPlayers: number;
};

export type JoinGameSessionInput = {
  gameSessionId: string;
  guestUsername?: string; // untuk user yang belum login
};

export type StartGameSessionInput = {
  gameSessionId: string;
};

export type SubmitAnswerInput = {
  gamePlayerId: string;
  questionId: string;
  optionId: string | null;
  timeTaken: number;
};

// Buat sesi game baru (hanya owner kuis)
export async function createGameSession(input: CreateGameSessionInput): Promise<
  | { ok: true; gameSessionId: string }
  | { ok: false; error: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: "Harus login dulu." };

  // Cek apakah user adalah owner kuis
  const { data: quiz } = await supabase
    .from("quizzes")
    .select("created_by")
    .eq("id", input.quizId)
    .single();

  if (!quiz || quiz.created_by !== user.id) {
    return { ok: false, error: "Anda bukan pemilik kuis ini." };
  }

  const { data, error } = await supabase
    .from("game_sessions")
    .insert({
      quiz_id: input.quizId,
      owner_id: user.id,
      min_players: input.minPlayers,
      status: "waiting",
    })
    .select("id")
    .single();

  if (error || !data) {
    return { ok: false, error: error?.message ?? "Gagal membuat sesi game." };
  }

  return { ok: true, gameSessionId: data.id };
}

// Join ke sesi game
export async function joinGameSession(input: JoinGameSessionInput): Promise<
  | { ok: true; gamePlayerId: string }
  | { ok: false; error: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Validasi: jika tidak login, harus ada guestUsername
  if (!user && !input.guestUsername) {
    return { ok: false, error: "Masukkan username untuk bergabung." };
  }

  // Validasi guestUsername: tidak boleh kosong, minimal 2 karakter, maksimal 50
  if (!user && input.guestUsername) {
    const trimmedUsername = input.guestUsername.trim();
    if (trimmedUsername.length < 2) {
      return { ok: false, error: "Username terlalu pendek (min 2 karakter)." };
    }
    if (trimmedUsername.length > 50) {
      return { ok: false, error: "Username terlalu panjang (maks 50 karakter)." };
    }
  }

  // Cek status sesi game
  const { data: session } = await supabase
    .from("game_sessions")
    .select("status, min_players, quiz_id, owner_id")
    .eq("id", input.gameSessionId)
    .single();

  if (!session) {
    return { ok: false, error: "Sesi game tidak ditemukan." };
  }

  if (session.status !== "waiting") {
    return { ok: false, error: "Sesi game sudah dimulai atau selesai." };
  }

  // Cek apakah kuisnya public atau user adalah pemiliknya (jika login)
  const { data: quiz } = await supabase
    .from("quizzes")
    .select("is_public, created_by")
    .eq("id", session.quiz_id)
    .single();

  if (!quiz) {
    return { ok: false, error: "Kuis tidak ditemukan." };
  }

  // Jika user login, cek permission
  if (user && !quiz.is_public && user.id !== session.owner_id && user.id !== quiz.created_by) {
    return { ok: false, error: "Kuis ini tidak publik." };
  }

  // Cek apakah sudah join:
  // - Jika user login: cek user_id
  // - Jika guest: tidak bisa cek (karena tidak ada identitas permanen), biarkan join
  if (user) {
    const { data: existing } = await supabase
      .from("game_players")
      .select("id")
      .eq("game_session_id", input.gameSessionId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing) {
      return { ok: true, gamePlayerId: existing.id };
    }
  }

  // Insert game player
  const insertData: any = {
    game_session_id: input.gameSessionId,
  };

  if (user) {
    insertData.user_id = user.id;
  } else if (input.guestUsername) {
    insertData.guest_username = input.guestUsername.trim();
  }

  const { data, error } = await supabase
    .from("game_players")
    .insert(insertData)
    .select("id")
    .single();

  if (error || !data) {
    return { ok: false, error: error?.message ?? "Gagal bergabung ke sesi game." };
  }

  // Increment plays_count per pemain (hanya sekali)
  if (session.quiz_id) {
    await supabase.rpc("increment_plays", { quiz: session.quiz_id });
    // Update plays_incremented
    await supabase
      .from("game_players")
      .update({ plays_incremented: true })
      .eq("id", data.id);
  }

  return { ok: true, gamePlayerId: data.id };
}

// Mulai sesi game (hanya owner)
export async function startGameSession(input: StartGameSessionInput): Promise<
  | { ok: true }
  | { ok: false; error: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: "Harus login dulu." };

  // Cek apakah user adalah owner
  const { data: session } = await supabase
    .from("game_sessions")
    .select("owner_id, min_players, status")
    .eq("id", input.gameSessionId)
    .single();

  if (!session) {
    return { ok: false, error: "Sesi game tidak ditemukan." };
  }

  if (session.owner_id !== user.id) {
    return { ok: false, error: "Anda bukan pemilik sesi game ini." };
  }

  if (session.status !== "waiting") {
    return { ok: false, error: "Sesi game sudah dimulai." };
  }

  // Cek jumlah pemain
  const { count } = await supabase
    .from("game_players")
    .select("*", { count: "exact", head: true })
    .eq("game_session_id", input.gameSessionId);

  if (!count || count < session.min_players) {
    return { ok: false, error: `Minimal ${session.min_players} pemain diperlukan.` };
  }

  const { error } = await supabase
    .from("game_sessions")
    .update({
      status: "active",
      started_at: new Date().toISOString(),
      current_question: 0,
    })
    .eq("id", input.gameSessionId);

  if (error) {
    return { ok: false, error: error?.message ?? "Gagal memulai sesi game." };
  }

  return { ok: true };
}

// Submit jawaban pemain
export async function submitAnswer(input: SubmitAnswerInput): Promise<
  | { ok: true }
  | { ok: false; error: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Cek apakah player ada (untuk guest, tidak perlu user_id)
  const { data: player } = await supabase
    .from("game_players")
    .select("id, user_id")
    .eq("id", input.gamePlayerId)
    .single();

  if (!player) {
    return { ok: false, error: "Anda bukan pemain dalam sesi ini." };
  }

  // Cek jawaban yang benar
  const { data: option } = await supabase
    .from("options")
    .select("is_correct")
    .eq("id", input.optionId)
    .maybeSingle();

  const isCorrect = option?.is_correct ?? false;

  // Simpan jawaban
  const { error: answerError } = await supabase
    .from("game_answers")
    .insert({
      game_player_id: input.gamePlayerId,
      question_id: input.questionId,
      option_id: input.optionId,
      is_correct: isCorrect,
      time_taken: input.timeTaken,
    });

  if (answerError) {
    return { ok: false, error: answerError?.message ?? "Gagal menyimpan jawaban." };
  }

  // Update skor pemain
  if (isCorrect) {
    const points = 100 + Math.max(0, (20 - input.timeTaken) * 10);
    const { error: updateError } = await supabase.rpc("increment_game_score", {
      game_player_id: input.gamePlayerId,
      points: points,
    });

    if (updateError) {
      return { ok: false, error: updateError?.message ?? "Gagal update skor." };
    }
  }

  return { ok: true };
}

// Get game session dengan data lengkap
export async function getGameSession(gameSessionId: string) {
  const supabase = await createClient();

  const { data: session } = await supabase
    .from("game_sessions")
    .select("*, quizzes(*, categories(*))")
    .eq("id", gameSessionId)
    .single();

  if (!session) return null;

  const { data: players } = await supabase
    .from("game_players")
    .select("*, profiles(*)")
    .eq("game_session_id", gameSessionId)
    .order("score", { ascending: false });

  return {
    session,
    players: players ?? [],
  };
}

// Get ranking real-time
export async function getGameRanking(gameSessionId: string) {
  const supabase = await createClient();

  const { data: players } = await supabase
    .from("game_players")
    .select("*, profiles(*)")
    .eq("game_session_id", gameSessionId)
    .order("score", { ascending: false });

  return players ?? [];
}

// End a game session (only owner)
export async function endGameSession(gameSessionId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: "Harus login dulu." };

  // Check if user is owner
  const { data: session } = await supabase
    .from("game_sessions")
    .select("owner_id")
    .eq("id", gameSessionId)
    .single();

  if (!session) {
    return { ok: false, error: "Sesi game tidak ditemukan." };
  }

  if (session.owner_id !== user.id) {
    return { ok: false, error: "Anda bukan pemilik sesi game ini." };
  }

  // Update status to completed
  const { error } = await supabase
    .from("game_sessions")
    .update({ status: "completed", ended_at: new Date().toISOString() })
    .eq("id", gameSessionId);

  if (error) {
    return { ok: false, error: error.message ?? "Gagal mengakhiri game." };
  }

  return { ok: true };
}

// Get all game sessions owned by current user
export async function getMyGameSessions() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data: sessions } = await supabase
    .from("game_sessions")
    .select("*, quizzes(*)")
    .eq("owner_id", user.id)
    .eq("hidden", false)
    .order("created_at", { ascending: false });

  return sessions ?? [];
}

// Get all hidden game sessions owned by current user
export async function getMyHiddenGameSessions() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data: sessions } = await supabase
    .from("game_sessions")
    .select("*, quizzes(*)")
    .eq("owner_id", user.id)
    .eq("hidden", true)
    .order("created_at", { ascending: false });

  return sessions ?? [];
}

// Toggle game session hidden status
export async function toggleGameSessionHidden(input: { gameSessionId: string; hidden: boolean }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: "Harus login dulu." };

  const { error } = await supabase
    .from("game_sessions")
    .update({ hidden: input.hidden })
    .eq("id", input.gameSessionId)
    .eq("owner_id", user.id);

  if (error) {
    return { ok: false, error: error.message ?? "Gagal menyembunyikan game." };
  }

  return { ok: true };
}
