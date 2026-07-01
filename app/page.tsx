import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { TopNav } from "@/app/components/TopNav";
import { Footer } from "@/app/components/Footer";
import { BottomNav } from "@/app/components/BottomNav";
import { HomeHero } from "@/app/components/HomeHero";
import { StatsSection } from "@/app/components/StatsSection";

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
        <section className="py-12 md:py-20 bg-on-background text-white relative overflow-hidden">
          <div className="max-w-container-max mx-auto px-margin md:px-gutter relative z-10">
            <StatsSection
              stats={[
                { value: playerCount ?? 0, suffix: "+", label: "Pemain Terdaftar", colorClass: "text-secondary-container" },
                { value: quizCount ?? 0, suffix: "+", label: "Assessment Tersedia", colorClass: "text-primary-fixed-dim" },
                { value: attemptCount ?? 0, suffix: "+", label: "Permainan Selesai", colorClass: "text-tertiary-fixed-dim" },
                { value: 24, suffix: "/7", label: "Kompetisi Live", colorClass: "text-secondary-fixed" },
              ]}
            />
          </div>
          <div className="absolute top-0 right-0 w-1/3 h-full bg-primary opacity-10 skew-x-[-20deg] translate-x-20" />
        </section>

        {/* CTA */}
        {!user && (
          <section className="py-12 md:py-24 px-margin md:px-gutter flex justify-center">
            <div className="neo-card bg-secondary-fixed text-on-background p-8 md:p-20 max-w-4xl w-full text-center relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="font-headline-xl text-headline-lg-mobile md:text-headline-xl mb-4 md:mb-6">
                  Siap Memulai Assessment?
                </h2>
                <p className="font-body-lg text-body-lg mb-6 md:mb-10 max-w-xl mx-auto">
                  Bergabung dan mulai assessment untuk kebutuhan perusahaan.
                </p>
                <div className="flex flex-col gap-4 md:flex-row md:gap-6 justify-center">
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
