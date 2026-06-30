"use client";

import { useRef } from "react";
import Link from "next/link";
import { joinByGameCode } from "@/app/join/actions";

export function GameCodeForm({ error }: { error?: string }) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleFocus = () => {
    const card = cardRef.current;
    if (!card) return;
    card.classList.add("scale-[1.02]");
    card.style.transform = "rotate(0deg)";
  };

  const handleBlur = () => {
    const card = cardRef.current;
    if (!card) return;
    card.classList.remove("scale-[1.02]");
    card.style.transform = "rotate(1deg)";
  };

  return (
    <div
      ref={cardRef}
      className="mt-12 bg-white border-4 border-on-background p-8 md:p-10 neo-shadow-lg max-w-md mx-auto relative transform rotate-[1deg] transition-transform"
    >
      <h2 className="font-headline-md text-headline-md mb-6">Siap Main?</h2>

      {error && (
        <div className="mb-4 bg-error-container text-on-error-container border-2 border-on-background px-4 py-3 font-label-bold text-label-bold text-sm">
          {error}
        </div>
      )}

      <form action={joinByGameCode} className="space-y-4">
        <div className="relative">
          <input
            className="w-full neo-input p-5 text-center font-headline-md text-headline-md uppercase tracking-widest placeholder:text-outline-variant placeholder:font-body-md"
            maxLength={6}
            name="code"
            placeholder="MASUKKAN KODE GAME"
            type="text"
            required
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </div>
        <button
          className="w-full neo-button-primary py-5 font-headline-md flex items-center justify-center gap-3"
          type="submit"
        >
          GABUNG SEKARANG
          <span className="material-symbols-outlined">rocket_launch</span>
        </button>
      </form>
      <div className="mt-4 text-on-surface-variant font-label-bold">
        ATAU{" "}
        <Link className="text-primary hover:underline" href="/library">
          PILIH KUIS DARI LIBRARY
        </Link>
      </div>
    </div>
  );
}
