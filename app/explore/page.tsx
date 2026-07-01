import { createClient } from "@/lib/supabase/server";
import { TopNav } from "@/app/components/TopNav";
import { Footer } from "@/app/components/Footer";
import { BottomNav } from "@/app/components/BottomNav";
import { ExploreHeader } from "./ExploreHeader";
import { ExploreGrid } from "./ExploreGrid";
import type { Category, Quiz } from "@/lib/types";

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string; search?: string }>;
}) {
  const { cat, search } = await searchParams;
  const supabase = await createClient();

  // Get categories
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  // Get public quizzes
  let quizQuery = supabase
    .from("quizzes")
    .select("*, categories(*)")
    .eq("is_public", true)
    .order("plays_count", { ascending: false });

  // Filter by category
  if (cat) {
    quizQuery = quizQuery.eq("categories.slug", cat);
  }

  // Filter by search
  if (search) {
    quizQuery = quizQuery.ilike("title", `%${search}%`);
  }

  const { data: quizzes } = await quizQuery;

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface">
      <TopNav active="explore" />

      <main className="flex-grow w-full max-w-[1200px] mx-auto pt-8 px-margin md:px-gutter pb-24 md:pb-12">
        <ExploreHeader
          categories={(categories ?? []) as Category[]}
          cat={cat}
          search={search}
        />
        <ExploreGrid
          quizzes={(quizzes ?? []) as Quiz[]}
          search={search}
          cat={cat}
        />
      </main>

      <Footer />
      <BottomNav active="explore" />
    </div>
  );
}
