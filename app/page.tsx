import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatPlays } from "@/lib/utils";
import { TopNav } from "@/app/components/TopNav";
import { Footer } from "@/app/components/Footer";
import { BottomNav } from "@/app/components/BottomNav";
import { HomeHero } from "@/app/components/HomeHero";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [
    { count: quizCount },
    { count: playerCount },
    { count: attemptCount },
  ] = await Promise.all([
    supabase.from("quizzes").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("attempts").select("*", { count: "exact", head: true }),
  ]);

  return (
    <>
      <TopNav active="home" />

      <main className="w-full">
        <HomeHero error={error} />

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
                  Assessment Tersedia
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
        {!user && (
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
        )}
      </main>

      <Footer />
      <BottomNav active="home" />
    </>
  );
}
