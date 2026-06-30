"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/user";

export async function joinByGameCode(formData: FormData) {
  const raw = String(formData.get("code") ?? "").trim().toUpperCase();
  if (!raw) {
    redirect("/?error=" + encodeURIComponent("Masukkan kode game dulu."));
  }

  const supabase = await createClient();
  const user = await getCurrentUser();

  // Cari di game_sessions terlebih dahulu
  if (raw.includes("-")) {
    const { data: session } = await supabase
      .from("game_sessions")
      .select("id, status, quiz_id, owner_id")
      .eq("id", raw.toLowerCase())
      .maybeSingle();

    if (session && session.status === "waiting") {
      // Cek apakah kuisnya public atau user adalah pemiliknya
      const { data: quiz } = await supabase
        .from("quizzes")
        .select("is_public, created_by")
        .eq("id", session.quiz_id)
        .single();

      if (quiz && (quiz.is_public || (user && user.id === session.owner_id) || (user && user.id === quiz.created_by))) {
        redirect(`/game/${session.id}/join`);
      } else {
        redirect("/?error=" + encodeURIComponent("Kuis ini tidak publik."));
      }
    }
  }

  const { data: sessions } = await supabase.from("game_sessions").select("id, status, quiz_id, owner_id");

  if (sessions?.length) {
    for (const s of sessions) {
      if (s.status === "waiting" && s.id.replace(/-/g, "").toUpperCase().startsWith(raw)) {
        const { data: quiz } = await supabase
          .from("quizzes")
          .select("is_public, created_by")
          .eq("id", s.quiz_id)
          .single();

        if (quiz && (quiz.is_public || (user && user.id === s.owner_id) || (user && user.id === quiz.created_by))) {
          redirect(`/game/${s.id}/join`);
        } else {
          redirect("/?error=" + encodeURIComponent("Kuis ini tidak publik."));
        }
      }
    }
  }

  // Jika tidak ketemu di game_sessions, coba cari di quizzes
  if (raw.includes("-")) {
    const { data } = await supabase
      .from("quizzes")
      .select("id, is_public, created_by")
      .eq("id", raw.toLowerCase())
      .maybeSingle();

    if (data) {
      if (data.is_public || (user && user.id === data.created_by)) {
        redirect(`/play/${data.id}`);
      } else {
        redirect("/?error=" + encodeURIComponent("Kuis ini tidak publik."));
      }
    }
  }

  const { data: quizzes, error } = await supabase.from("quizzes").select("id, is_public, created_by");

  if (error || !quizzes?.length) {
    redirect("/?error=" + encodeURIComponent("Kode game tidak ditemukan."));
  }

  const match = quizzes.find((q) =>
    q.id.replace(/-/g, "").toUpperCase().startsWith(raw),
  );

  if (!match) {
    redirect("/?error=" + encodeURIComponent("Kode game tidak ditemukan."));
  }

  if (match.is_public || (user && user.id === match.created_by)) {
    redirect(`/play/${match.id}`);
  } else {
    redirect("/?error=" + encodeURIComponent("Kuis ini tidak publik."));
  }
}
