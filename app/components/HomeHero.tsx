"use client";

import { useEffect } from "react";
import { GameCodeForm } from "./GameCodeForm";

export function HomeHero({ error }: { error?: string }) {
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const x = (window.innerWidth - e.pageX * 2) / 100;
      const y = (window.innerHeight - e.pageY * 2) / 100;
      document
        .querySelectorAll<HTMLElement>("section .material-symbols-outlined")
        .forEach((icon) => {
          icon.style.transform = `translateX(${x}px) translateY(${y}px)`;
        });
    };
    document.addEventListener("mousemove", handleMove);
    return () => document.removeEventListener("mousemove", handleMove);
  }, []);

  return (
    <section className="relative min-h-[819px] flex flex-col items-center justify-center text-center px-6 py-20 overflow-hidden">
      <div className="z-10 max-w-4xl space-y-8 animate-float">
        <div className="inline-block bg-secondary-container border-2 border-on-background px-4 py-1 rounded-full font-label-bold text-label-bold rotate-[-2deg] neo-shadow-sm mb-4">
          🎉 LEVEL UP BELAJARMU!
        </div>
        <h1 className="font-headline-xl text-headline-xl leading-none">
          MAIN. BELAJAR. <br />
          <span className="text-primary underline decoration-8 decoration-secondary-container">
            MENANGKAN
          </span>{" "}
          REKOR.
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
          Platform quiz interaktif paling asik se-Indonesia. Tantang
          temanmu, kumpulkan lencana, dan jadilah yang terpintar di kelas!
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
