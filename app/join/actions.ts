"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/user";

export async function joinByGameCode(formData: FormData) {
  const raw = String(formData.get("code") ?? "").trim().toUpperCase().replace(/-/g, "");
  if (!raw) {
    redirect("/?error=" + encodeURIComponent("Masukkan kode game dulu."));
  }

  const supabase = await createClient();
  const user = await getCurrentUser();

  // Cari di game_sessions terlebih dahulu (hanya yang waiting)
  const { data: allSessions } = await supabase
    .from("game_sessions")
    .select("id, status, quiz_id, owner_id")
    .eq("status", "waiting");

  if (allSessions?.length) {
    for (const s of allSessions) {
      const sessionCode = s.id.replace(/-/g, "").toUpperCase();
      if (sessionCode.startsWith(raw) || sessionCode === raw) {
        // Cek apakah kuisnya public atau user adalah pemiliknya
        const { data: quiz } = await supabase
          .from("quizzes")
          .select("is_public, created_by")
          .eq("id", s.quiz_id)
          .single();

        if (quiz && (quiz.is_public || (user && user.id === s.owner_id) || (user && user.id === quiz.created_by))) {
          redirect(`/game/${s.id}/join`);
        } else {
          redirect("/?error=" + encodeURIComponent("Kuis ini tidak publik. Hanya pemilik yang bisa mengaksesnya."));
        }
      }
    }
  }

  // Jika tidak ketemu di game_sessions, coba cari di quizzes
  const { data: quizzes } = await supabase.from("quizzes").select("id, is_public, created_by");

  if (quizzes?.length) {
    for (const q of quizzes) {
      const quizCode = q.id.replace(/-/g, "").toUpperCase();
      if (quizCode.startsWith(raw) || quizCode === raw) {
        if (q.is_public || (user && user.id === q.created_by)) {
          redirect(`/play/${q.id}`);
        } else {
          redirect("/?error=" + encodeURIComponent("Kuis ini tidak publik. Hanya pemilik yang bisa mengaksesnya."));
        }
      }
    }
  }

  redirect("/?error=" + encodeURIComponent("Kode game tidak ditemukan. Pastikan kode yang kamu masukkan benar dan game masih menunggu pemain."));
}
