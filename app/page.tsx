import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatPlays } from "@/lib/utils";
import { TopNav } from "@/app/components/TopNav";
import { Footer } from "@/app/components/Footer";
import { BottomNav } from "@/app/components/BottomNav";
import { HomeHero } from "@/app/components/HomeHero";
import { MaterialIcon } from "@/app/components/MaterialIcon";
import type { Category, Quiz } from "@/lib/types";

type CategoryWithCount = Category & { quiz_count: number; top_quiz?: Quiz | null };

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();

  const [
    { data: categoriesRaw },
    { data: quizzes },
    { count: quizCount },
    { count: playerCount },
    { count: attemptCount },
  ] = await Promise.all([
    supabase.from("categories").select("*").order("name"),
    supabase
      .from("quizzes")
      .select("*, categories(*)")
      .order("plays_count", { ascending: false }),
    supabase.from("quizzes").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("attempts").select("*", { count: "exact", head: true }),
  ]);

  const categories: CategoryWithCount[] = (categoriesRaw ?? []).map((cat) => {
    const catQuizzes = (quizzes ?? []).filter((q) => q.category_id === cat.id);
    return {
      ...cat,
      quiz_count: catQuizzes.length,
      top_quiz: catQuizzes[0] ?? null,
    };
  });

  const featured = categories
    .filter((c) => c.quiz_count > 0)
    .sort((a, b) => b.quiz_count - a.quiz_count);

  const heroCategory = featured[0];
  const sideCategories = featured.slice(1, 3);
  const restCategories = featured.slice(3);

  return (
    <>
      <TopNav active="explore" />

      <main className="w-full">
        <HomeHero error={error} />

        {/* Kategori Populer — data dari Supabase */}
        <section className="bg-surface-container-low py-20 px-margin md:px-gutter">
          <div className="max-w-container-max mx-auto">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="font-headline-xl text-headline-lg mb-2">
                  Kategori Populer
                </h2>
                <p className="text-on-surface-variant">
                  Pilih topik dan mulai assessment.
                </p>
              </div>
              <Link
                href="/library"
                className="neo-button-secondary px-6 py-2 hidden md:flex items-center gap-2 font-label-bold"
              >
                LIHAT SEMUA
                <MaterialIcon name="arrow_forward" />
              </Link>
            </div>

            {featured.length === 0 ? (
              <div className="neo-card border-dashed p-12 text-center">
                <MaterialIcon
                  name="quiz"
                  className="text-6xl text-outline-variant"
                />
                <p className="font-headline-md text-on-surface-variant mt-4">
                  Belum ada assessment publik.
                </p>
                <Link
                  href="/library"
                  className="inline-block mt-6 neo-button-secondary px-6 py-2 font-label-bold"
                >
                  BUKA LIBRARY
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {heroCategory && (
                  <Link
                    href={`/library?cat=${heroCategory.slug}`}
                    className="md:col-span-2 lg:col-span-2 neo-card hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] cursor-pointer group flex flex-col h-full"
                  >
                    <div className="h-48 relative overflow-hidden border-b-4 border-on-background bg-surface-container">
                      {heroCategory.top_quiz?.cover_image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          alt={heroCategory.top_quiz.title}
                          src={heroCategory.top_quiz.cover_image}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <MaterialIcon
                            name={heroCategory.icon}
                            filled
                            className="text-8xl text-primary opacity-40"
                          />
                        </div>
                      )}
                      <div className="absolute top-4 left-4 bg-tertiary-container text-on-tertiary-container px-3 py-1 border-2 border-on-background font-label-bold rounded-full">
                        {heroCategory.name.toUpperCase()}
                      </div>
                    </div>
                    <div className="p-6 flex-grow flex flex-col justify-between">
                      <div>
                        <h3 className="font-headline-md text-headline-md mb-2">
                          {heroCategory.top_quiz?.title ?? heroCategory.name}
                        </h3>
                        <p className="text-on-surface-variant mb-4">
                          {heroCategory.top_quiz?.description ??
                            `Jelajahi kuis ${heroCategory.name} terbaik.`}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-on-surface-variant font-label-bold">
                          {heroCategory.quiz_count}+ Quiz
                        </span>
                        <MaterialIcon
                          name="trending_flat"
                          className="text-primary group-hover:translate-x-2 transition-transform"
                        />
                      </div>
                    </div>
                  </Link>
                )}

                {sideCategories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/library?cat=${cat.slug}`}
                    className="neo-card hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] cursor-pointer group flex flex-col h-full"
                  >
                    <div className="p-6 bg-secondary-container border-b-4 border-on-background flex justify-between items-start">
                      <MaterialIcon name={cat.icon} filled className="text-4xl" />
                      <div className="bg-white border-2 border-on-background px-2 py-1 rounded font-label-bold text-[12px]">
                        {cat.quiz_count} KUIS
                      </div>
                    </div>
                    <div className="p-6 flex-grow flex flex-col justify-between bg-white">
                      <div>
                        <h3 className="font-headline-md text-headline-md mb-2">
                          {cat.name}
                        </h3>
                        <p className="text-on-surface-variant text-sm">
                          {cat.top_quiz?.title ?? `Assessment ${cat.name} tersedia.`}
                        </p>
                      </div>
                      {cat.top_quiz && (
                        <div className="mt-4 flex items-center gap-1 text-on-surface-variant">
                          <MaterialIcon name="group" className="text-[18px]" />
                          <span className="font-label-bold text-[12px]">
                            {formatPlays(cat.top_quiz.plays_count)} Main
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>
                ))}

                {restCategories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/library?cat=${cat.slug}`}
                    className="neo-card p-6 bg-primary-container text-on-primary-container flex flex-col justify-center items-center text-center gap-4 group cursor-pointer lg:col-span-1"
                  >
                    <div className="w-16 h-16 bg-white rounded-full border-4 border-on-background flex items-center justify-center neo-shadow-sm group-hover:scale-110 transition-transform">
                      <MaterialIcon
                        name={cat.icon}
                        className="text-3xl text-on-background"
                      />
                    </div>
                    <h3 className="font-headline-md">{cat.name}</h3>
                    <span className="font-label-bold text-sm">
                      {cat.quiz_count} Quiz
                    </span>
                  </Link>
                ))}

                <div className="lg:col-span-2 neo-card border-dashed bg-transparent flex flex-col items-center justify-center p-8 shadow-none">
                  <MaterialIcon
                    name="add_circle"
                    className="text-6xl text-outline-variant mb-4"
                  />
                  <h3 className="font-headline-md text-on-surface-variant">
                    Kategori Lainnya?
                  </h3>
                  <p className="text-on-surface-variant text-center mt-2">
                    Buat assessment sesuai kebutuhan perusahaan.
                  </p>
                  <Link
                    href="/library"
                    className="mt-6 neo-button-secondary px-8 py-3 font-label-bold"
                  >
                    BUKA LIBRARY
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Stats — angka real dari database */}
        <section className="py-20 bg-on-background text-white relative overflow-hidden">
          <div className="max-w-container-max mx-auto px-margin md:px-gutter relative z-10">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 text-center">
              <div>
                <div className="text-6xl font-headline-xl text-secondary-container mb-2">
                  {formatPlays(playerCount ?? 0)}+
                </div>
                <div className="font-label-bold uppercase tracking-widest text-outline-variant">
                  Pemain Terdaftar
                </div>
              </div>
              <div>
                <div className="text-6xl font-headline-xl text-primary-fixed-dim mb-2">
                  {formatPlays(quizCount ?? 0)}+
                </div>
                <div className="font-label-bold uppercase tracking-widest text-outline-variant">
                  Quiz Tersedia
                </div>
              </div>
              <div>
                <div className="text-6xl font-headline-xl text-tertiary-fixed-dim mb-2">
                  {formatPlays(attemptCount ?? 0)}+
                </div>
                <div className="font-label-bold uppercase tracking-widest text-outline-variant">
                  Permainan Selesai
                </div>
              </div>
              <div>
                <div className="text-6xl font-headline-xl text-secondary-fixed mb-2">
                  24/7
                </div>
                <div className="font-label-bold uppercase tracking-widest text-outline-variant">
                  Kompetisi Live
                </div>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-1/3 h-full bg-primary opacity-10 skew-x-[-20deg] translate-x-20" />
        </section>

        {/* CTA */}
        <section className="py-24 px-margin md:px-gutter flex justify-center">
          <div className="neo-card bg-secondary-fixed text-on-background p-12 md:p-20 max-w-4xl w-full text-center relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="font-headline-xl text-headline-xl mb-6">
                Siap Memulai Assessment?
              </h2>
              <p className="font-body-lg text-body-lg mb-10 max-w-xl mx-auto">
                Bergabung dan mulai assessment untuk kebutuhan perusahaan.
              </p>
              <div className="flex flex-col md:flex-row gap-6 justify-center">
                <Link
                  href="/signup"
                  className="neo-button-primary px-10 py-5 font-headline-md"
                >
                  DAFTAR GRATIS
                </Link>
                <Link
                  href="/login"
                  className="bg-white border-4 border-on-background px-10 py-5 font-headline-md neo-shadow-sm hover:bg-surface-container-high transition-all"
                >
                  MASUK
                </Link>
              </div>
            </div>
            <div className="absolute -top-10 -left-10 w-40 h-40 border-4 border-on-background rounded-full opacity-20" />
            <div className="absolute -bottom-20 -right-20 w-64 h-64 border-4 border-on-background rounded-full opacity-20" />
          </div>
        </section>
      </main>

      <Footer />
      <BottomNav active="home" />
    </>
  );
}
