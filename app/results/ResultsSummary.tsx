"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { MaterialIcon } from "@/app/components/MaterialIcon";
import { gsap, EASE_OUT, EASE_BOUNCE, countUp } from "@/lib/gsap";

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
  const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

  const heroRef = useRef<HTMLElement>(null);
  const scoreCardRef = useRef<HTMLDivElement>(null);
  const accuracyCardRef = useRef<HTMLDivElement>(null);
  const scoreValRef = useRef<HTMLParagraphElement>(null);
  const accuracyValRef = useRef<HTMLParagraphElement>(null);
  const detailRef = useRef<HTMLElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: EASE_OUT } });

    if (heroRef.current) {
      tl.fromTo(heroRef.current, { opacity: 0, y: 30, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.55 });
    }
    if (scoreCardRef.current) {
      tl.fromTo(scoreCardRef.current, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.4 }, "-=0.2");
    }
    if (accuracyCardRef.current) {
      tl.fromTo(accuracyCardRef.current, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.4 }, "-=0.3");
    }

    // Count-up animations
    tl.add(() => {
      if (scoreValRef.current) {
        countUp(scoreValRef.current, score, 0.9, (v) => v.toLocaleString("id-ID"));
      }
      if (accuracyValRef.current) {
        countUp(accuracyValRef.current, accuracy, 0.8, (v) => `${v}%`);
      }
    }, "-=0.3");

    if (detailRef.current) {
      const cells = detailRef.current.querySelectorAll("[data-cell]");
      tl.fromTo(cells, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.3, stagger: 0.08 }, "-=0.4");
    }
    if (actionsRef.current) {
      tl.fromTo(actionsRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.35 }, "-=0.2");
    }

    return () => { tl.kill(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col">
      <header className="w-full flex justify-between items-center px-margin md:px-gutter py-4 sticky top-0 z-50 bg-background border-b-4 border-on-background">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/library"
            className="shrink-0 bg-surface-container-high border-2 border-on-background p-2 neo-shadow-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
          >
            <MaterialIcon name="close" className="block" />
          </Link>
          <div className="min-w-0">
            <p className="font-label-bold text-label-bold uppercase tracking-wider text-outline truncate">
              {categoryName}
            </p>
            <p className="font-headline-md text-headline-md leading-tight truncate">
              {title}
            </p>
          </div>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center p-margin md:p-gutter">
        <div className="w-full max-w-3xl space-y-6 md:space-y-8">
          <section ref={heroRef} className="bg-primary-container border-4 border-on-background neo-shadow-md p-6 md:p-8 text-center">
            <MaterialIcon name="emoji_events" filled className="text-[56px] md:text-[64px] mb-3 md:mb-4" />
            <h1 className="font-headline-xl text-headline-lg-mobile md:text-headline-xl mb-2">Hasil Kuis</h1>
            {subtitle ? <p className="font-body-lg text-body-lg text-on-primary-container font-bold">{subtitle}</p> : null}
          </section>

          <section className="grid grid-cols-2 gap-4 md:gap-6">
            <div ref={scoreCardRef} className="bg-tertiary-container border-4 border-on-background neo-shadow-md p-4 md:p-6 text-center">
              <p className="font-label-bold text-label-bold uppercase text-on-tertiary-container mb-2">Skor</p>
              <p ref={scoreValRef} className="font-headline-md md:font-headline-xl text-headline-md md:text-headline-xl">
                {score.toLocaleString("id-ID")}
              </p>
            </div>
            <div ref={accuracyCardRef} className="bg-secondary-container border-4 border-on-background neo-shadow-md p-4 md:p-6 text-center">
              <p className="font-label-bold text-label-bold uppercase text-on-secondary-container mb-2">Akurasi</p>
              <p ref={accuracyValRef} className="font-headline-md md:font-headline-xl text-headline-md md:text-headline-xl">{accuracy}%</p>
            </div>
          </section>

          <section ref={detailRef} className="bg-surface border-4 border-on-background neo-shadow-md p-4 md:p-6">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div data-cell className="bg-surface-container border-2 border-on-background p-3 md:p-4">
                <p className="font-label-bold text-[10px] md:text-label-bold uppercase text-outline mb-1 md:mb-2">Benar</p>
                <p className="font-headline-sm md:font-headline-md text-headline-sm md:text-headline-md">{correctCount}/{totalCount}</p>
              </div>
              <div data-cell className="bg-surface-container border-2 border-on-background p-3 md:p-4">
                <p className="font-label-bold text-[10px] md:text-label-bold uppercase text-outline mb-1 md:mb-2">Salah</p>
                <p className="font-headline-sm md:font-headline-md text-headline-sm md:text-headline-md">{Math.max(0, totalCount - correctCount)}</p>
              </div>
              <div data-cell className="bg-surface-container border-2 border-on-background p-3 md:p-4">
                <p className="font-label-bold text-[10px] md:text-label-bold uppercase text-outline mb-1 md:mb-2">Waktu</p>
                <p className="font-headline-sm md:font-headline-md text-headline-sm md:text-headline-md">{formatDuration(timeTaken)}</p>
              </div>
            </div>
          </section>

          <div ref={actionsRef} className="flex flex-col gap-3 md:flex-row md:gap-4 md:justify-center">
            <Link href="/library" className="w-full md:w-auto neo-button-primary px-8 py-4 font-headline-md text-headline-md text-center">
              KEMBALI KE LIBRARY
            </Link>
            <Link href="/explore" className="w-full md:w-auto bg-surface-container border-4 border-on-background px-8 py-4 font-headline-md text-headline-md neo-shadow-sm btn-interact text-center">
              CARI KUIS LAIN
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
