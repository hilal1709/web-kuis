import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/user";
import { TopNav } from "@/app/components/TopNav";
import { Footer } from "@/app/components/Footer";
import { BottomNav } from "@/app/components/BottomNav";
import { MaterialIcon } from "@/app/components/MaterialIcon";
import { getMyGameSessions, getMyHiddenGameSessions } from "@/app/game/actions";
import { LibraryClient } from "./LibraryClient";
import type { Category, Quiz, GameSession } from "@/lib/types";

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string; created?: string; questions?: string }>;
}) {
  const { cat, created, questions: questionCount } = await searchParams;
  const supabase = await createClient();
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirect=/library");
  }

  let quizQuery = supabase
    .from("quizzes")
    .select("*, categories(*)")
    .eq("created_by", user.id)
    .order("created_at", { ascending: false });

  const { data: allMyQuizzes } = await quizQuery;
  const myGameSessions = await getMyGameSessions();
  const myHiddenGameSessions = await getMyHiddenGameSessions();

  const categoryMap = new Map<string, Category>();
  for (const quiz of allMyQuizzes ?? []) {
    if (quiz.categories) categoryMap.set(quiz.categories.id, quiz.categories);
  }
  const categories = [...categoryMap.values()].sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  const quizzes = allMyQuizzes ?? [];

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

        <section className="flex-grow">
          <LibraryClient
            categories={categories}
            quizzes={quizzes}
            myGameSessions={myGameSessions as any}
            myHiddenGameSessions={myHiddenGameSessions as any}
            initialCat={cat}
            created={created}
            questionCount={questionCount}
          />
        </section>
      </main>

      <Footer />
      <BottomNav active="library" />
    </div>
  );
}
