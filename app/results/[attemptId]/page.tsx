import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TopNav } from "@/app/components/TopNav";
import { Footer } from "@/app/components/Footer";
import { BottomNav } from "@/app/components/BottomNav";
import { MaterialIcon } from "@/app/components/MaterialIcon";
import { Confetti } from "@/app/components/Confetti";

export default async function AttemptResultPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const { attemptId } = await params;
  const supabase = await createClient();

  const { data: attempt } = await supabase
    .from("attempts")
    .select("*, profiles(username), quizzes(title, id)")
    .eq("id", attemptId)
    .single();

  if (!attempt) notFound();

  const pct =
    attempt.total_count > 0
      ? Math.round((attempt.correct_count / attempt.total_count) * 100)
      : 0;
  const isGreat = pct >= 70;

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface relative overflow-hidden">
      {isGreat && <Confetti />}
      <TopNav active="reports" />

      <main className="flex-grow flex flex-col items-center justify-center px-margin md:px-gutter py-12 relative z-10">
        <div className="neo-card bg-white p-10 md:p-14 max-w-lg w-full text-center">
          <div className="inline-block bg-secondary-container border-2 border-on-background px-4 py-1 mb-6 font-label-bold rounded-full">
            HASIL MAIN
          </div>

          <h1 className="font-headline-xl text-headline-lg mb-2">
            {attempt.quizzes?.title ?? "Kuis"}
          </h1>
          <p className="text-on-surface-variant mb-8">
            oleh {attempt.profiles?.username ?? "Pemain"}
          </p>

          <div className="text-7xl font-headline-xl text-primary mb-2">
            {attempt.score.toLocaleString("id-ID")}
          </div>
          <p className="font-label-bold uppercase text-on-surface-variant mb-8">
            Total Skor
          </p>

          <div className="grid grid-cols-3 gap-4 mb-10">
            <div className="bg-tertiary-fixed-dim border-2 border-on-background p-4">
              <p className="font-headline-md text-headline-md">
                {attempt.correct_count}
              </p>
              <p className="font-label-bold text-[12px] uppercase">Benar</p>
            </div>
            <div className="bg-error-container border-2 border-on-background p-4">
              <p className="font-headline-md text-headline-md">
                {attempt.total_count - attempt.correct_count}
              </p>
              <p className="font-label-bold text-[12px] uppercase">Salah</p>
            </div>
            <div className="bg-secondary-container border-2 border-on-background p-4">
              <p className="font-headline-md text-headline-md">{pct}%</p>
              <p className="font-label-bold text-[12px] uppercase">Akurasi</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {attempt.quizzes?.id && (
              <Link
                href={`/play/${attempt.quizzes.id}`}
                className="neo-button-primary px-8 py-4 font-headline-md flex items-center justify-center gap-2"
              >
                <MaterialIcon name="replay" />
                MAIN LAGI
              </Link>
            )}
            <Link
              href="/results"
              className="neo-button-secondary px-8 py-4 font-headline-md flex items-center justify-center gap-2"
            >
              <MaterialIcon name="leaderboard" />
              PERINGKAT
            </Link>
          </div>
        </div>
      </main>

      <Footer />
      <BottomNav active="activity" />
    </div>
  );
}
