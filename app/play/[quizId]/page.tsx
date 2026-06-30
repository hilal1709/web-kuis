import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Question } from "@/lib/types";
import { GameClient } from "./GameClient";

export default async function PlayPage({
  params,
}: {
  params: Promise<{ quizId: string }>;
}) {
  const { quizId } = await params;
  const supabase = await createClient();

  const { data: quiz } = await supabase
    .from("quizzes")
    .select("*, categories(*)")
    .eq("id", quizId)
    .single();

  if (!quiz) notFound();

  const { data: questions } = await supabase
    .from("questions")
    .select("*, options(*)")
    .eq("quiz_id", quizId)
    .order("position");

  // Urutkan opsi tiap pertanyaan
  const ordered: Question[] = (questions ?? []).map((q) => ({
    ...q,
    options: [...(q.options ?? [])].sort((a, b) => a.position - b.position),
  }));

  if (ordered.length === 0) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-6 text-center">
        <h1 className="font-headline-md text-headline-md">
          Kuis ini belum punya pertanyaan.
        </h1>
        <Link
          href="/library"
          className="neo-button-primary px-8 py-4 font-headline-md"
        >
          KEMBALI KE LIBRARY
        </Link>
      </main>
    );
  }

  return (
    <GameClient
      quizId={quiz.id}
      categoryName={quiz.categories?.name ?? "Umum"}
      quizTitle={quiz.title}
      questions={ordered}
    />
  );
}
