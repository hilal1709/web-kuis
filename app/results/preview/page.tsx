import Link from "next/link";
import { TopNav } from "@/app/components/TopNav";
import { Footer } from "@/app/components/Footer";
import { BottomNav } from "@/app/components/BottomNav";
import { MaterialIcon } from "@/app/components/MaterialIcon";
import { Confetti } from "@/app/components/Confetti";

export default async function PreviewResultPage({
  searchParams,
}: {
  searchParams: Promise<{
    score?: string;
    correct?: string;
    total?: string;
    time?: string;
    quiz?: string;
  }>;
}) {
  const { score, correct, total, time, quiz } = await searchParams;

  const scoreNum = Number(score ?? 0);
  const correctNum = Number(correct ?? 0);
  const totalNum = Number(total ?? 0);
  const pct = totalNum > 0 ? Math.round((correctNum / totalNum) * 100) : 0;
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
            {quiz ?? "Kuis"}
          </h1>
          <p className="text-on-surface-variant mb-8">
            Mode tamu — skor tidak disimpan
          </p>

          <div className="text-7xl font-headline-xl text-primary mb-2">
            {scoreNum.toLocaleString("id-ID")}
          </div>
          <p className="font-label-bold uppercase text-on-surface-variant mb-8">
            Total Skor · {time ?? 0}s
          </p>

          <div className="grid grid-cols-3 gap-4 mb-10">
            <div className="bg-tertiary-fixed-dim border-2 border-on-background p-4">
              <p className="font-headline-md text-headline-md">{correctNum}</p>
              <p className="font-label-bold text-[12px] uppercase">Benar</p>
            </div>
            <div className="bg-error-container border-2 border-on-background p-4">
              <p className="font-headline-md text-headline-md">
                {totalNum - correctNum}
              </p>
              <p className="font-label-bold text-[12px] uppercase">Salah</p>
            </div>
            <div className="bg-secondary-container border-2 border-on-background p-4">
              <p className="font-headline-md text-headline-md">{pct}%</p>
              <p className="font-label-bold text-[12px] uppercase">Akurasi</p>
            </div>
          </div>

          <div className="bg-primary-container text-on-primary-container border-2 border-on-background p-4 mb-8 font-label-bold text-sm">
            <Link href="/login" className="text-primary underline">
              Masuk
            </Link>{" "}
            untuk menyimpan skor dan muncul di papan peringkat!
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/library"
              className="neo-button-primary px-8 py-4 font-headline-md flex items-center justify-center gap-2"
            >
              <MaterialIcon name="library_books" />
              LIBRARY
            </Link>
            <Link
              href="/signup"
              className="neo-button-secondary px-8 py-4 font-headline-md flex items-center justify-center gap-2"
            >
              <MaterialIcon name="person_add" />
              DAFTAR
            </Link>
          </div>
        </div>
      </main>

      <Footer />
      <BottomNav active="activity" />
    </div>
  );
}
