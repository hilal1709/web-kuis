"use client";

import { useEffect, useRef } from "react";

const COLORS = ["#004ac6", "#fed01b", "#006242", "#ba1a1a", "#4edea3"];

export function Confetti() {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    function burst() {
      if (!wrapper) return;
      // Reduce particles from 50 to 30 for better performance
      for (let i = 0; i < 30; i++) {
        const c = document.createElement("div");
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];
        const isCircle = Math.random() > 0.5;
        const size = Math.random() * 12 + 8 + "px";
        c.className = "confetti-particle";
        c.style.left = Math.random() * 100 + "vw";
        c.style.top = "-20px";
        c.style.width = size;
        c.style.height = size;
        c.style.backgroundColor = color;
        c.style.border = "2px solid #000";
        c.style.zIndex = "0";
        if (isCircle) c.style.borderRadius = "50%";
        const duration = Math.random() * 3 + 2;
        const delay = Math.random() * 2;
        c.style.animationDuration = duration + "s";
        c.style.animationDelay = delay + "s";
        wrapper.appendChild(c);
        setTimeout(() => c.remove(), (duration + delay) * 1000);
      }
    }

    burst();
    // Increase interval from 5000ms to 8000ms to reduce frequency
    const interval = setInterval(burst, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="fixed inset-0 pointer-events-none z-0"
      aria-hidden="true"
    />
  );
}
