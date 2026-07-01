import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ResultsSummary } from "../ResultsSummary";

export default async function AttemptResultsPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const { attemptId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: attempt } = await supabase
    .from("attempts")
    .select(
      "id, score, correct_count, total_count, time_taken, quizzes(title, categories(name))",
    )
    .eq("id", attemptId)
    .single();

  if (!attempt) {
    notFound();
  }

  const quiz = Array.isArray(attempt.quizzes)
    ? attempt.quizzes[0]
    : attempt.quizzes;
  const category = Array.isArray(quiz?.categories)
    ? quiz.categories[0]
    : quiz?.categories;

  return (
    <ResultsSummary
      title={quiz?.title ?? "Kuis"}
      categoryName={category?.name ?? "Umum"}
      score={attempt.score}
      correctCount={attempt.correct_count}
      totalCount={attempt.total_count}
      timeTaken={attempt.time_taken}
      subtitle="Skor kamu sudah tersimpan."
    />
  );
}
