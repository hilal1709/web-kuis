"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { gsap, EASE_OUT, EASE_BOUNCE } from "@/lib/gsap";
import { joinByGameCode } from "@/app/join/actions";
import { SubmitButton } from "./SubmitButton";

export function GameCodeForm({ error }: { error?: string }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  // Subtle entrance — card slides up into its rotated resting position
  useEffect(() => {
    if (!cardRef.current) return;
    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 30, rotate: -3 },
      { opacity: 1, y: 0, rotate: 1, duration: 0.55, ease: EASE_BOUNCE, delay: 0.1 },
    );
  }, []);

  const handleFocus = () => {
    if (!cardRef.current) return;
    gsap.to(cardRef.current, { scale: 1.02, rotate: 0, duration: 0.25, ease: EASE_OUT });
  };

  const handleBlur = () => {
    if (!cardRef.current) return;
    gsap.to(cardRef.current, { scale: 1, rotate: 1, duration: 0.3, ease: EASE_OUT });
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
            maxLength={10}
            name="code"
            placeholder="MASUKKAN KODE GAME"
            type="text"
            required
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </div>
        <SubmitButton
          className="w-full neo-button-primary py-5 font-headline-md flex items-center justify-center gap-3"
          pendingText="MENGGABUNGKAN…"
        >
          GABUNG SEKARANG
          <span className="material-symbols-outlined">rocket_launch</span>
        </SubmitButton>
      </form>
      <div className="mt-4 text-on-surface-variant font-label-bold">
        ATAU{" "}
        <Link className="text-primary hover:underline" href="/explore">
          JELAJAHI ASSESSMENT
        </Link>
      </div>
    </div>
  );
}
