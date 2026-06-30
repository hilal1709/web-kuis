"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function joinByGameCode(formData: FormData) {
  const raw = String(formData.get("code") ?? "").trim().toUpperCase();
  if (!raw) {
    redirect("/?error=" + encodeURIComponent("Masukkan kode game dulu."));
  }

  const supabase = await createClient();

  // Cari di game_sessions terlebih dahulu
  if (raw.includes("-")) {
    const { data: session } = await supabase
      .from("game_sessions")
      .select("id, status")
      .eq("id", raw.toLowerCase())
      .maybeSingle();
    if (session && session.status === "waiting") {
      redirect(`/game/${session.id}/join`);
    }
  }

  const { data: sessions } = await supabase.from("game_sessions").select("id, status");

  if (sessions?.length) {
    const matchSession = sessions.find((s) =>
      s.status === "waiting" && s.id.replace(/-/g, "").toUpperCase().startsWith(raw),
    );
    if (matchSession) {
      redirect(`/game/${matchSession.id}/join`);
    }
  }

  // Jika tidak ketemu di game_sessions, coba cari di quizzes
  if (raw.includes("-")) {
    const { data } = await supabase
      .from("quizzes")
      .select("id")
      .eq("id", raw.toLowerCase())
      .maybeSingle();
    if (data) redirect(`/play/${data.id}`);
  }

  const { data: quizzes, error } = await supabase.from("quizzes").select("id");

  if (error || !quizzes?.length) {
    redirect("/?error=" + encodeURIComponent("Kode game tidak ditemukan."));
  }

  const match = quizzes.find((q) =>
    q.id.replace(/-/g, "").toUpperCase().startsWith(raw),
  );

  if (!match) {
    redirect("/?error=" + encodeURIComponent("Kode game tidak ditemukan."));
  }

  redirect(`/play/${match.id}`);
}
