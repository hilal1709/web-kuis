"use client";

import { useEffect, useRef } from "react";
import { gsap, EASE_OUT, countUp } from "@/lib/gsap";

interface StatItem {
  value: number;
  suffix?: string;
  label: string;
  colorClass: string;
}

export function StatsSection({ stats }: { stats: StatItem[] }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const valueRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!sectionRef.current) return;

    // Use IntersectionObserver so animation triggers when section scrolls into view
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        observer.disconnect();

        const tl = gsap.timeline({ defaults: { ease: EASE_OUT } });

        // Stagger the stat blocks
        const blocks = sectionRef.current?.querySelectorAll("[data-stat]");
        if (blocks?.length) {
          tl.fromTo(
            blocks,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.45, stagger: 0.1 },
          );
        }

        // Count-up each number
        valueRefs.current.forEach((el, i) => {
          if (!el) return;
          const stat = stats[i];
          tl.add(() => {
            countUp(
              el,
              stat.value,
              1.2,
              (v) => `${v.toLocaleString("id-ID")}${stat.suffix ?? ""}`,
            );
          }, i === 0 ? "-=0.3" : "<0.1");
        });
      },
      { threshold: 0.3 },
    );

    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div ref={sectionRef} className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12 text-center">
      {stats.map((stat, i) => (
        <div key={i} data-stat>
          <div
            ref={(el) => { valueRefs.current[i] = el; }}
            className={`text-4xl md:text-6xl font-headline-xl ${stat.colorClass} mb-2`}
          >
            {stat.value.toLocaleString("id-ID")}{stat.suffix ?? ""}
          </div>
          <div className="font-label-bold text-[11px] md:text-sm uppercase tracking-widest text-outline-variant">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}
