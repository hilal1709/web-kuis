"use client";

import { useEffect, useRef } from "react";
import { gsap, EASE_OUT } from "@/lib/gsap";

/**
 * Attaches a GSAP fade+slide entrance to a container ref.
 * Children with data-anim="item" will stagger in after the container.
 */
export function useGsapEntrance<T extends HTMLElement = HTMLDivElement>(
  options: { delay?: number; stagger?: boolean } = {},
) {
  const ref = useRef<T>(null);
  const { delay = 0, stagger = false } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const tl = gsap.timeline();

    tl.fromTo(
      el,
      { opacity: 0, y: 28 },
      { opacity: 1, y: 0, duration: 0.5, ease: EASE_OUT, delay, clearProps: "all" },
    );

    if (stagger) {
      const items = el.querySelectorAll("[data-anim='item']");
      if (items.length) {
        tl.fromTo(
          items,
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.35, ease: EASE_OUT, stagger: 0.07, clearProps: "all" },
          "-=0.25",
        );
      }
    }

    return () => { tl.kill(); };
  }, [delay, stagger]);

  return ref;
}
