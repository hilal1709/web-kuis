import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/user";
import { addQuestions, updateQuiz } from "@/app/library/actions";
import { TopNav } from "@/app/components/TopNav";
import { Footer } from "@/app/components/Footer";
import { BottomNav } from "@/app/components/BottomNav";
import { MaterialIcon } from "@/app/components/MaterialIcon";
import { QuestionBuilder } from "@/app/components/QuestionBuilder";
import type { Question } from "@/lib/types";

const LETTERS = ["A", "B", "C", "D"];

export default async function EditQuizPage({
  params,
  searchParams,
}: {
  params: Promise<{ quizId: string }>;
  searchParams: Promise<{ error?: string; added?: string }>;
}) {
  const { quizId } = await params;
  const { error, added } = await searchParams;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?redirect=/library/${quizId}/edit`);

  const supabase = await createClient();

  const { data: quiz } = await supabase
    .from("quizzes")
    .select("*, categories(*)")
    .eq("id", quizId)
    .eq("created_by", user.id)
    .single();

  if (!quiz) notFound();

  const { data: questionsRaw } = await supabase
    .from("questions")
    .select("*, options(*)")
    .eq("quiz_id", quizId)
    .order("position");

  const questions: Question[] = (questionsRaw ?? []).map((q) => ({
    ...q,
    options: [...(q.options ?? [])].sort((a, b) => a.position - b.position),
  }));

  const addedCount = added ? Number(added) : 0;

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface">
      <TopNav active="library" />

      <main className="flex-grow w-full max-w-2xl mx-auto pt-8 px-margin md:px-gutter pb-24">
        <Link
          href="/library"
          className="inline-flex items-center gap-2 font-label-bold text-primary mb-6 hover:underline"
        >
          <MaterialIcon name="arrow_back" />
          KEMBALI KE LIBRARY
        </Link>

        <div className="mb-6">
          <h1 className="font-headline-md text-headline-md">{quiz.title}</h1>
          <p className="text-on-surface-variant mt-1">
            {quiz.categories?.name ?? "Umum"} · {questions.length} pertanyaan
          </p>
          {addedCount > 0 && (
            <p className="mt-2 font-label-bold text-primary">
              {addedCount} pertanyaan baru berhasil ditambahkan!
            </p>
          )}
        </div>

        <div className="mb-8 bg-white border-4 border-on-background p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <form action={updateQuiz} className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <input type="hidden" name="quiz_id" value={quizId} />
            <div className="flex items-center gap-3">
              <input
                id="is_public_edit"
                className="w-6 h-6"
                type="checkbox"
                name="is_public"
                defaultChecked={quiz.is_public}
              />
              <label htmlFor="is_public_edit" className="font-label-bold">
                Publikasikan kuis (semua orang bisa melihat)
              </label>
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-primary text-on-primary border-4 border-on-background shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all font-label-bold uppercase"
            >
              Simpan Pengaturan
            </button>
          </form>
        </div>

        {questions.length > 0 && (
          <section className="mb-8 space-y-4">
            <h2 className="font-label-bold uppercase text-primary">
              Pertanyaan ({questions.length})
            </h2>
            {questions.map((q, idx) => (
              <div
                key={q.id}
                className="bg-surface border-4 border-on-background p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="font-label-bold text-primary">#{idx + 1}</p>
                  <span className="inline-flex items-center gap-1 text-[12px] font-label-bold uppercase bg-secondary-container border border-on-background px-2 py-0.5">
                    <MaterialIcon name="timer" className="text-[14px]" />
                    {q.time_limit}s
                  </span>
                </div>
                <p className="font-body-md mb-3">{q.question_text}</p>
                <ul className="space-y-1 text-sm">
                  {q.options.map((opt, i) => (
                    <li
                      key={opt.id}
                      className={
                        opt.is_correct
                          ? "font-label-bold text-primary"
                          : "text-on-surface-variant"
                      }
                    >
                      {LETTERS[i]}. {opt.option_text}
                      {opt.is_correct && " ✓"}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        )}

        <div className="bg-white border-4 border-on-background p-8 md:p-10 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="font-headline-md text-headline-md mb-2">
            Tambah Pertanyaan
          </h2>
          <p className="text-on-surface-variant mb-6">
            Bisa tambah banyak pertanyaan sekaligus — klik{" "}
            <strong>Tambah Pertanyaan Lagi</strong> sebelum simpan.
          </p>

          {error && (
            <div className="mb-6 bg-error-container text-on-error-container border-2 border-on-background px-4 py-3 font-label-bold">
              {error}
            </div>
          )}

          <form action={addQuestions} className="space-y-6">
            <input type="hidden" name="quiz_id" value={quizId} />
            <QuestionBuilder />
            <button
              type="submit"
              className="w-full neo-button-primary py-4 font-headline-md flex items-center justify-center gap-2"
            >
              SIMPAN PERTANYAAN BARU
              <MaterialIcon name="add" />
            </button>
          </form>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Link
            href={`/play/${quizId}`}
            className="flex-1 text-center neo-button-secondary py-3 font-label-bold uppercase"
          >
            Preview Main
          </Link>
          <Link
            href="/library"
            className="flex-1 text-center py-3 border-4 border-on-background bg-secondary font-label-bold uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            Selesai
          </Link>
        </div>
      </main>

      <Footer />
      <BottomNav active="library" />
    </div>
  );
}
