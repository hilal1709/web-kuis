import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { TopNav } from "@/app/components/TopNav";
import { Footer } from "@/app/components/Footer";
import { BottomNav } from "@/app/components/BottomNav";
import { MaterialIcon } from "@/app/components/MaterialIcon";
import { formatPlays } from "@/lib/utils";
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
        <header className="mb-10">
          <h1 className="font-headline-xl text-headline-lg md:text-headline-xl text-on-background leading-none">
            Jelajahi Assessment
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">
            Temukan dan mainkan assessment publik dari berbagai kategori.
          </p>
        </header>

        {/* Search Bar */}
        <div className="mb-8">
          <form className="relative">
            <input
              name="search"
              type="text"
              placeholder="Cari assessment..."
              defaultValue={search}
              className="w-full bg-surface border-4 border-on-background py-4 px-6 pr-12 font-body-md focus:outline-none focus:border-primary transition-all neo-shadow-sm"
            />
            <button
              type="submit"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
            >
              <MaterialIcon name="search" className="text-2xl" />
            </button>
          </form>
        </div>

        {/* Category Filters */}
        {categories && categories.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            <Link
              href="/explore"
              className={`px-4 py-2 border-2 border-on-background font-label-bold text-[12px] uppercase transition-all ${
                !cat
                  ? "bg-secondary-container neo-shadow-sm"
                  : "bg-surface hover:bg-surface-container-high"
              }`}
            >
              Semua
            </Link>
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/explore?cat=${c.slug}`}
                className={`px-4 py-2 border-2 border-on-background font-label-bold text-[12px] uppercase transition-all ${
                  cat === c.slug
                    ? "bg-secondary-container neo-shadow-sm"
                    : "bg-surface hover:bg-surface-container-high"
                }`}
              >
                {c.name}
              </Link>
            ))}
          </div>
        )}

        {/* Quiz Grid */}
        {quizzes && quizzes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {quizzes.map((quiz: Quiz, i: number) => (
              <div
                key={quiz.id}
                className="group bg-surface border-4 border-on-background shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col transition-all"
              >
                <div className="h-40 border-b-4 border-on-background overflow-hidden relative bg-surface-container">
                  <div className="absolute top-2 left-2 z-10">
                    <span className="px-3 py-1 bg-secondary-container border-2 border-on-background font-label-bold text-[12px] uppercase">
                      {quiz.categories?.name ?? "Umum"}
                    </span>
                  </div>
                  {quiz.cover_image ? (
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
                  {quiz.description && (
                    <p className="text-on-surface-variant text-sm line-clamp-2">
                      {quiz.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-on-surface-variant">
                    <div className="flex items-center gap-1">
                      <MaterialIcon name="group" className="text-[18px]" />
                      <span className="font-label-bold">
                        {formatPlays(quiz.plays_count)} Kali
                      </span>
                    </div>
                  </div>
                  <div className="mt-auto">
                    <Link
                      href={`/play/${quiz.id}`}
                      className="w-full text-center py-3 border-4 border-on-background bg-primary text-on-primary font-label-bold uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-none transition-all block"
                    >
                      Main Sekarang
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border-4 border-dashed border-on-background p-12 text-center">
            <MaterialIcon name="search_off" className="text-6xl text-outline-variant" />
            <p className="font-headline-md text-on-surface-variant mt-4">
              {search || cat
                ? "Tidak ada assessment yang ditemukan."
                : "Belum ada assessment publik."}
            </p>
          </div>
        )}
      </main>

      <Footer />
      <BottomNav active="explore" />
    </div>
  );
}
