"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function joinByGameCode(formData: FormData) {
  const raw = String(formData.get("code") ?? "").trim().toUpperCase();
  if (!raw) {
    redirect("/?error=" + encodeURIComponent("Masukkan kode game dulu."));
  }

  const supabase = await createClient();

  // UUID lengkap
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
