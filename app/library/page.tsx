import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/user";
import { TopNav } from "@/app/components/TopNav";
import { Footer } from "@/app/components/Footer";
import { BottomNav } from "@/app/components/BottomNav";
import { MaterialIcon } from "@/app/components/MaterialIcon";
import { formatPlays } from "@/lib/utils";
import { createGameSession } from "@/app/game/actions";
import type { Category, Quiz } from "@/lib/types";

const BADGE_COLORS = [
  "bg-secondary-container",
  "bg-tertiary-fixed",
  "bg-primary-fixed",
];

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string; created?: string; questions?: string }>;
}) {
  const { cat, created, questions: questionCount } = await searchParams;
  const supabase = await createClient();
  const user = await getCurrentUser();

  if (!user) redirect("/login?redirect=/library");

  let quizQuery = supabase
    .from("quizzes")
    .select("*, categories(*)")
    .eq("created_by", user.id)
    .order("created_at", { ascending: false });

  const { data: allMyQuizzes } = await quizQuery;

  const categoryMap = new Map<string, Category>();
  for (const quiz of allMyQuizzes ?? []) {
    if (quiz.categories) categoryMap.set(quiz.categories.id, quiz.categories);
  }
  const categories = [...categoryMap.values()].sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  let quizzes = allMyQuizzes ?? [];
  if (cat) {
    quizzes = quizzes.filter((q) => q.categories?.slug === cat);
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface">
      <TopNav active="library" />

      <main className="flex-grow flex flex-col md:flex-row w-full max-w-[1200px] mx-auto pt-8 px-margin md:px-gutter gap-gutter mb-20 md:mb-12">
        <aside className="w-full md:w-64 flex flex-col gap-6">
          {categories.length > 0 && (
            <div className="bg-surface border-4 border-on-background p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="font-headline-md text-headline-md mb-4 text-primary uppercase">
                Kategori
              </h2>
              <ul className="flex flex-wrap md:flex-col gap-3">
                <li>
                  <Link
                    href="/library"
                    className={`w-full flex items-center justify-between px-4 py-2 border-2 border-on-background font-label-bold text-label-bold transition-all ${
                      !cat
                        ? "bg-secondary-container neo-shadow-sm"
                        : "bg-surface hover:bg-surface-container-high"
                    }`}
                  >
                    Semua <MaterialIcon name="grid_view" />
                  </Link>
                </li>
                {categories.map((c: Category) => (
                  <li key={c.id}>
                    <Link
                      href={`/library?cat=${c.slug}`}
                      className={`w-full flex items-center justify-between px-4 py-2 border-2 border-on-background font-label-bold text-label-bold transition-all ${
                        cat === c.slug
                          ? "bg-secondary-container neo-shadow-sm"
                          : "bg-surface hover:bg-surface-container-high"
                      }`}
                    >
                      {c.name} <MaterialIcon name={c.icon} />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

        </aside>

        <section className="flex-grow flex flex-col gap-8">
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="font-headline-xl text-headline-lg md:text-headline-xl text-on-background leading-none">
                Koleksi Kuis Saya
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">
                Assessment yang Anda buat.
              </p>
              {created === "1" && (
                <p className="mt-2 font-label-bold text-primary">
                  Kuis berhasil dibuat
                  {questionCount
                    ? ` dengan ${questionCount} pertanyaan`
                    : ""}
                  !
                </p>
              )}
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {quizzes.map((quiz: Quiz, i: number) => (
              <div
                key={quiz.id}
                className="group bg-surface border-4 border-on-background shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col transition-all"
              >
                <div className="h-40 border-b-4 border-on-background overflow-hidden relative bg-surface-container">
                  <div className="absolute top-2 left-2 z-10">
                    <span
                      className={`px-3 py-1 ${BADGE_COLORS[i % BADGE_COLORS.length]} border-2 border-on-background font-label-bold text-[12px] uppercase`}
                    >
                      {quiz.categories?.name ?? "Umum"}
                    </span>
                  </div>
                  {quiz.cover_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      alt={quiz.title}
                      src={quiz.cover_image}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <MaterialIcon
                        name="quiz"
                        className="text-6xl text-outline-variant"
                      />
                    </div>
                  )}
                </div>
                <div className="p-6 flex flex-col gap-4 flex-grow">
                  <h3 className="font-headline-md text-headline-md leading-tight group-hover:text-primary transition-colors">
                    {quiz.title}
                  </h3>
                  <div className="flex items-center gap-4 text-on-surface-variant">
                    <div className="flex items-center gap-1">
                      <MaterialIcon name="group" className="text-[18px]" />
                      <span className="font-label-bold">
                        {formatPlays(quiz.plays_count)} Kali
                      </span>
                    </div>
                    <span className="font-label-bold text-[11px] uppercase bg-surface-container-high px-2 py-0.5 border border-on-background">
                      Kode: {quiz.id.replace(/-/g, "").slice(0, 6).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2 mt-auto">
                    <Link
                      href={`/library/${quiz.id}/edit`}
                      className="w-full text-center py-3 border-4 border-on-background bg-primary-container text-on-primary-container font-label-bold uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
                    >
                      Kelola Pertanyaan
                    </Link>
                    <form action={async () => {
                      "use server";
                      const res = await createGameSession({
                        quizId: quiz.id,
                        minPlayers: 2,
                      });
                      if (res.ok) {
                        redirect(`/game/${res.gameSessionId}`);
                      }
                    }}>
                      <button
                        type="submit"
                        className="w-full text-center py-3 border-4 border-on-background bg-tertiary text-on-background font-label-bold uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-none transition-all"
                      >
                        Buat Game Live
                      </button>
                    </form>
                    <Link
                      href={`/play/${quiz.id}`}
                      className="w-full text-center py-3 border-4 border-on-background bg-secondary text-on-background font-label-bold uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-none transition-all"
                    >
                      Mulai Main
                    </Link>
                  </div>
                </div>
              </div>
            ))}

            {quizzes.length === 0 && (
              <div className="col-span-full border-4 border-dashed border-on-background p-12 text-center">
                <MaterialIcon
                  name="quiz"
                  className="text-6xl text-outline-variant"
                />
                <p className="font-headline-md text-on-surface-variant mt-4">
                  {cat
                    ? "Belum ada assessment di kategori ini."
                    : "Belum ada assessment."}
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
      <BottomNav active="search" />
    </div>
  );
}
