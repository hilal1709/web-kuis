"use client";

import { useEffect, useCallback, useRef } from "react";
import { GameCodeForm } from "./GameCodeForm";

export function HomeHero({ error }: { error?: string }) {
  const rafRef = useRef<number>(0);

  const handleMove = useCallback((e: MouseEvent) => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      const x = (window.innerWidth - e.pageX * 2) / 100;
      const y = (window.innerHeight - e.pageY * 2) / 100;
      document
        .querySelectorAll<HTMLElement>("section .material-symbols-outlined")
        .forEach((icon) => {
          icon.style.transform = `translateX(${x}px) translateY(${y}px)`;
        });
    });
  }, []);

  useEffect(() => {
    document.addEventListener("mousemove", handleMove, { passive: true });
    return () => {
      document.removeEventListener("mousemove", handleMove);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [handleMove]);

  return (
    <section className="relative min-h-[819px] flex flex-col items-center justify-center text-center px-6 py-20 overflow-hidden">
      <div className="z-10 max-w-4xl space-y-8 animate-float">
        <div className="inline-block bg-secondary-container border-2 border-on-background px-4 py-1 rounded-full font-label-bold text-label-bold rotate-[-2deg] neo-shadow-sm mb-4">
          🎉 ASSESSMENT PLATFORM
        </div>
        <h1 className="font-headline-xl text-headline-xl leading-none">
          BUAT. <br />
          <span className="text-primary underline decoration-8 decoration-secondary-container">
            KELOLA
          </span>{" "}
          ASSESSMENT.
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
          Platform assessment interaktif untuk perusahaan. Buat kuis,
          evaluasi karyawan, dan pantau performa tim.
        </p>

        <GameCodeForm error={error} />
      </div>

      <div className="absolute top-20 left-10 hidden lg:block opacity-40 rotate-12">
        <span
          className="material-symbols-outlined text-[120px] text-primary"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          school
        </span>
      </div>
      <div className="absolute bottom-20 right-10 hidden lg:block opacity-40 -rotate-12">
        <span
          className="material-symbols-outlined text-[100px] text-secondary"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          star
        </span>
      </div>
    </section>
  );
}
