"use client";

import Link from "next/link";
import { MaterialIcon } from "@/app/components/MaterialIcon";

type ResultsSummaryProps = {
  title: string;
  categoryName: string;
  score: number;
  correctCount: number;
  totalCount: number;
  timeTaken: number;
  subtitle?: string;
};

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes <= 0) return `${seconds} detik`;
  if (seconds === 0) return `${minutes} menit`;
  return `${minutes} menit ${seconds} detik`;
}

export function ResultsSummary({
  title,
  categoryName,
  score,
  correctCount,
  totalCount,
  timeTaken,
  subtitle,
}: ResultsSummaryProps) {
  const accuracy =
    totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col">
      <header className="w-full flex justify-between items-center px-margin md:px-gutter py-4 sticky top-0 z-50 bg-background border-b-4 border-on-background">
        <div className="flex items-center gap-4">
          <Link
            href="/library"
            className="bg-surface-container-high border-2 border-on-background p-2 neo-shadow-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
          >
            <MaterialIcon name="close" className="block" />
          </Link>
          <div>
            <p className="font-label-bold text-label-bold uppercase tracking-wider text-outline">
              {categoryName}
            </p>
            <p className="font-headline-md text-headline-md leading-tight">
              {title}
            </p>
          </div>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center p-margin md:p-gutter">
        <div className="w-full max-w-3xl space-y-8">
          <section className="bg-primary-container border-4 border-on-background neo-shadow-md p-8 text-center">
            <MaterialIcon
              name="emoji_events"
              filled
              className="text-[64px] mb-4"
            />
            <h1 className="font-headline-xl text-headline-lg-mobile md:text-headline-xl mb-2">
              Hasil Kuis
            </h1>
            {subtitle ? (
              <p className="font-body-lg text-body-lg text-outline">{subtitle}</p>
            ) : null}
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-tertiary-container border-4 border-on-background neo-shadow-md p-6 text-center">
              <p className="font-label-bold text-label-bold uppercase text-outline mb-2">
                Skor
              </p>
              <p className="font-headline-xl text-headline-xl">
                {score.toLocaleString("id-ID")}
              </p>
            </div>

            <div className="bg-secondary-container border-4 border-on-background neo-shadow-md p-6 text-center">
              <p className="font-label-bold text-label-bold uppercase text-outline mb-2">
                Akurasi
              </p>
              <p className="font-headline-xl text-headline-xl">{accuracy}%</p>
            </div>
          </section>

          <section className="bg-surface border-4 border-on-background neo-shadow-md p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="bg-surface-container border-2 border-on-background p-4">
                <p className="font-label-bold text-label-bold uppercase text-outline mb-2">
                  Jawaban Benar
                </p>
                <p className="font-headline-md text-headline-md">
                  {correctCount}/{totalCount}
                </p>
              </div>

              <div className="bg-surface-container border-2 border-on-background p-4">
                <p className="font-label-bold text-label-bold uppercase text-outline mb-2">
                  Jawaban Salah
                </p>
                <p className="font-headline-md text-headline-md">
                  {Math.max(0, totalCount - correctCount)}
                </p>
              </div>

              <div className="bg-surface-container border-2 border-on-background p-4">
                <p className="font-label-bold text-label-bold uppercase text-outline mb-2">
                  Waktu
                </p>
                <p className="font-headline-md text-headline-md">
                  {formatDuration(timeTaken)}
                </p>
              </div>
            </div>
          </section>

          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link
              href="/library"
              className="neo-button-primary px-8 py-4 font-headline-md text-headline-md text-center"
            >
              KEMBALI KE LIBRARY
            </Link>
            <Link
              href="/explore"
              className="bg-surface-container border-4 border-on-background px-8 py-4 font-headline-md text-headline-md neo-shadow-sm btn-interact text-center"
            >
              CARI KUIS LAIN
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
