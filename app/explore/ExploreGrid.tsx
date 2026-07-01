"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { MaterialIcon } from "@/app/components/MaterialIcon";
import { gsap, EASE_OUT } from "@/lib/gsap";
import { formatPlays } from "@/lib/utils";
import type { Quiz } from "@/lib/types";

export function ExploreGrid({ quizzes, search, cat }: {
  quizzes: Quiz[];
  search?: string;
  cat?: string;
}) {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!gridRef.current) return;
    const cards = gridRef.current.querySelectorAll("[data-card]");
    if (!cards.length) return;
    gsap.fromTo(
      cards,
      { opacity: 0, y: 28 },
      { opacity: 1, y: 0, duration: 0.4, ease: EASE_OUT, stagger: 0.06, clearProps: "all" },
    );
  }, [quizzes]);

  if (!quizzes || quizzes.length === 0) {
    return (
      <div className="border-4 border-dashed border-on-background p-12 text-center">
        <MaterialIcon name="search_off" className="text-6xl text-outline-variant" />
        <p className="font-headline-md text-on-surface-variant mt-4">
          {search || cat
            ? "Tidak ada assessment yang ditemukan."
            : "Belum ada assessment publik."}
        </p>
      </div>
    );
  }

  return (
    <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {quizzes.map((quiz, i) => (
        <div
          key={quiz.id}
          data-card
          className="group bg-surface border-4 border-on-background shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col transition-all"
        >
          <div className="h-40 border-b-4 border-on-background overflow-hidden relative bg-surface-container">
            <div className="absolute top-2 left-2 z-10">
              <span className="px-3 py-1 bg-secondary-container border-2 border-on-background font-label-bold text-[12px] uppercase">
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
                <MaterialIcon name="quiz" className="text-6xl text-outline-variant" />
              </div>
            )}
          </div>
          <div className="p-6 flex flex-col gap-4 flex-grow">
            <h3 className="font-headline-md text-headline-md leading-tight group-hover:text-primary transition-colors">
              {quiz.title}
            </h3>
            {quiz.description && (
              <p className="text-on-surface-variant text-sm line-clamp-2">{quiz.description}</p>
            )}
            <div className="flex items-center gap-4 text-on-surface-variant">
              <div className="flex items-center gap-1">
                <MaterialIcon name="group" className="text-[18px]" />
                <span className="font-label-bold">{formatPlays(quiz.plays_count)} Kali</span>
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
  );
}
