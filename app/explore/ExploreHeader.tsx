"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { MaterialIcon } from "@/app/components/MaterialIcon";
import { gsap, EASE_OUT } from "@/lib/gsap";
import type { Category } from "@/lib/types";

export function ExploreHeader({
  categories,
  cat,
  search,
}: {
  categories: Category[];
  cat?: string;
  search?: string;
}) {
  const headerRef = useRef<HTMLElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const pillsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: EASE_OUT } });
    if (headerRef.current)
      tl.fromTo(headerRef.current, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.4 });
    if (searchRef.current)
      tl.fromTo(searchRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.35 }, "-=0.2");
    if (pillsRef.current) {
      const pills = pillsRef.current.querySelectorAll("a");
      if (pills.length)
        tl.fromTo(pills, { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.25, stagger: 0.04 }, "-=0.15");
    }
    return () => { tl.kill(); };
  }, []);

  return (
    <>
      <header ref={headerRef} className="mb-10">
        <h1 className="font-headline-xl text-headline-lg md:text-headline-xl text-on-background leading-none">
          Jelajahi Assessment
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">
          Temukan dan mainkan assessment publik dari berbagai kategori.
        </p>
      </header>

      {/* Search Bar */}
      <div ref={searchRef} className="mb-8">
        <form className="relative">
          <input
            name="search"
            type="text"
            placeholder="Cari assessment..."
            defaultValue={search}
            className="w-full bg-surface border-4 border-on-background py-4 px-6 pr-12 font-body-md focus:outline-none focus:border-primary transition-all neo-shadow-sm"
          />
          <button
            type="submit"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
          >
            <MaterialIcon name="search" className="text-2xl" />
          </button>
        </form>
      </div>

      {/* Category Filters */}
      {categories && categories.length > 0 && (
        <div ref={pillsRef} className="mb-8 flex flex-wrap gap-2">
          <Link
            href="/explore"
            className={`px-4 py-2 border-2 border-on-background font-label-bold text-[12px] uppercase transition-all ${
              !cat
                ? "bg-secondary-container neo-shadow-sm"
                : "bg-surface hover:bg-surface-container-high"
            }`}
          >
            Semua
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/explore?cat=${c.slug}`}
              className={`px-4 py-2 border-2 border-on-background font-label-bold text-[12px] uppercase transition-all ${
                cat === c.slug
                  ? "bg-secondary-container neo-shadow-sm"
                  : "bg-surface hover:bg-surface-container-high"
              }`}
            >
              {c.name}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
