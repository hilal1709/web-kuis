"use client";

import { useEffect, useRef } from "react";
import { gsap, EASE_OUT } from "@/lib/gsap";

/**
 * Wraps a form card with an entrance animation (fade + slide up).
 * Use as a drop-in container for login/signup form cards.
 */
export function AnimatedFormCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(
      ref.current,
      { opacity: 0, y: 36, scale: 0.97 },
      { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: EASE_OUT, clearProps: "all" },
    );
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
