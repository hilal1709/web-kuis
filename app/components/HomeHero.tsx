"use client";

import { useEffect, useCallback, useRef } from "react";
import { gsap, pageEnter, staggerIn, EASE_OUT } from "@/lib/gsap";
import { GameCodeForm } from "./GameCodeForm";

export function HomeHero({ error }: { error?: string }) {
  const rafRef = useRef<number>(0);
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((e: MouseEvent) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
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
    // Entrance animations
    const tl = gsap.timeline({ defaults: { ease: EASE_OUT } });
    if (badgeRef.current) {
      tl.fromTo(badgeRef.current, { opacity: 0, y: -20, rotate: -6 }, { opacity: 1, y: 0, rotate: -2, duration: 0.45 });
    }
    if (headlineRef.current) {
      tl.fromTo(headlineRef.current, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.6 }, "-=0.2");
    }
    if (descRef.current) {
      tl.fromTo(descRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.45 }, "-=0.3");
    }
    if (formRef.current) {
      tl.fromTo(formRef.current, { opacity: 0, y: 30, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.5 }, "-=0.25");
    }

    document.addEventListener("mousemove", handleMove, { passive: true });
    return () => {
      document.removeEventListener("mousemove", handleMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      tl.kill();
    };
  }, [handleMove]);

  return (
    <section ref={sectionRef} className="relative min-h-[calc(100svh-72px)] md:min-h-[819px] flex flex-col items-center justify-center text-center px-6 py-16 overflow-hidden">
      <div ref={contentRef} className="z-10 max-w-4xl space-y-8 animate-float">
        <div ref={badgeRef} className="inline-block bg-secondary-container border-2 border-on-background px-4 py-1 rounded-full font-label-bold text-label-bold rotate-[-2deg] neo-shadow-sm mb-4">
          🎉 ASSESSMENT PLATFORM
        </div>
        <h1 ref={headlineRef} className="font-headline-xl text-headline-xl leading-none">
          BUAT. <br />
          <span className="text-primary underline decoration-8 decoration-secondary-container">
            KELOLA
          </span>{" "}
          ASSESSMENT.
        </h1>
        <p ref={descRef} className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
          Platform assessment interaktif untuk perusahaan. Buat kuis,
          evaluasi karyawan, dan pantau performa tim.
        </p>

        <div ref={formRef}>
          <GameCodeForm error={error} />
        </div>
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
