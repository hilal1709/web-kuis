import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { TopNav } from "@/app/components/TopNav";
import { Footer } from "@/app/components/Footer";
import { BottomNav } from "@/app/components/BottomNav";
import { MaterialIcon } from "@/app/components/MaterialIcon";
import type { Attempt } from "@/lib/types";

type AttemptRow = Attempt & {
  profiles: { username: string; avatar_url: string | null } | null;
  quizzes: { title: string } | null;
};

export default async function ResultsPage() {
  const supabase = await createClient();

  const { data: attempts } = await supabase
    .from("attempts")
    .select("*, profiles(username, avatar_url), quizzes(title)")
    .order("score", { ascending: false })
    .limit(20);

  const rows = (attempts ?? []) as AttemptRow[];

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface">
      <TopNav active="reports" />

      <main className="flex-grow w-full max-w-[900px] mx-auto pt-8 px-margin md:px-gutter pb-24 md:pb-12">
        <header className="mb-10">
          <h1 className="font-headline-xl text-headline-lg md:text-headline-xl text-on-background leading-none">
            Papan Peringkat
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">
            Skor tertinggi dari pemain Quizorama.
          </p>
        </header>

        {rows.length === 0 ? (
          <div className="neo-card border-dashed p-12 text-center">
            <MaterialIcon
              name="leaderboard"
              className="text-6xl text-outline-variant"
            />
            <p className="font-headline-md text-on-surface-variant mt-4">
              Belum ada skor tercatat. Main kuis dulu dari{" "}
              <Link href="/library" className="text-primary hover:underline">
                Library
              </Link>
              !
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {rows.map((row, i) => (
              <Link
                key={row.id}
                href={`/results/${row.id}`}
                className="flex items-center gap-4 bg-surface border-4 border-on-background p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all"
              >
                <span className="font-headline-md text-headline-md w-10 text-center text-primary">
                  #{i + 1}
                </span>
                <div className="w-10 h-10 border-2 border-on-background bg-secondary flex items-center justify-center font-headline-md uppercase shrink-0">
                  {(row.profiles?.username ?? "?").charAt(0)}
                </div>
                <div className="flex-grow min-w-0">
                  <p className="font-label-bold uppercase truncate">
                    {row.profiles?.username ?? "Anonim"}
                  </p>
                  <p className="text-on-surface-variant text-sm truncate">
                    {row.quizzes?.title ?? "Kuis"}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-headline-md text-headline-md text-primary">
                    {row.score.toLocaleString("id-ID")}
                  </p>
                  <p className="text-on-surface-variant text-[12px] font-label-bold">
                    {row.correct_count}/{row.total_count} benar
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-10 text-center">
          <Link
            href="/library"
            className="neo-button-secondary px-8 py-3 font-label-bold inline-flex items-center gap-2"
          >
            <MaterialIcon name="play_arrow" />
            MAIN LAGI
          </Link>
        </div>
      </main>

      <Footer />
      <BottomNav active="activity" />
    </div>
  );
}
