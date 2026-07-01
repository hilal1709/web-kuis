/**
 * GSAP utility — centralised animation helpers.
 * Import from here so all pages use the same eases & durations.
 */

// GSAP is client-only; never import this file in server components.
import { gsap } from "gsap";

// ── Eases ──────────────────────────────────────────────────────────────────
export const EASE_OUT = "power3.out";
export const EASE_IN_OUT = "power2.inOut";
export const EASE_BOUNCE = "back.out(1.4)";
export const EASE_ELASTIC = "elastic.out(1, 0.4)";

// ── Durations (seconds) ────────────────────────────────────────────────────
export const DUR_XS = 0.2;
export const DUR_SM = 0.35;
export const DUR_MD = 0.5;
export const DUR_LG = 0.7;

// ── Page enter ─────────────────────────────────────────────────────────────
/** Fade + slide-up the entire page wrapper on mount. */
export function pageEnter(el: Element | null) {
  if (!el) return;
  gsap.fromTo(
    el,
    { opacity: 0, y: 24 },
    { opacity: 1, y: 0, duration: DUR_MD, ease: EASE_OUT, clearProps: "all" },
  );
}

// ── Stagger list ───────────────────────────────────────────────────────────
/** Stagger-animate a list of elements. */
export function staggerIn(
  els: NodeListOf<Element> | Element[] | null,
  delay = 0,
) {
  if (!els || (els as Element[]).length === 0) return;
  gsap.fromTo(
    els,
    { opacity: 0, y: 20 },
    {
      opacity: 1,
      y: 0,
      duration: DUR_SM,
      ease: EASE_OUT,
      stagger: 0.07,
      delay,
      clearProps: "all",
    },
  );
}

// ── Hero text words ────────────────────────────────────────────────────────
/** Split-word stagger for big hero headlines. */
export function heroIn(container: Element | null, delay = 0) {
  if (!container) return;
  gsap.fromTo(
    container,
    { opacity: 0, scale: 0.94, y: 30 },
    {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: DUR_LG,
      ease: EASE_OUT,
      delay,
      clearProps: "all",
    },
  );
}

// ── Counter (number count-up) ──────────────────────────────────────────────
/** Animate a number from 0 to target, writing to element's textContent. */
export function countUp(
  el: Element | null,
  target: number,
  duration = DUR_LG,
  formatter?: (v: number) => string,
) {
  if (!el) return;
  const obj = { value: 0 };
  gsap.to(obj, {
    value: target,
    duration,
    ease: EASE_OUT,
    onUpdate() {
      el.textContent = formatter
        ? formatter(Math.round(obj.value))
        : String(Math.round(obj.value));
    },
  });
}

// ── Pop (scale bounce) ─────────────────────────────────────────────────────
/** Single element pop-in. */
export function popIn(el: Element | null, delay = 0) {
  if (!el) return;
  gsap.fromTo(
    el,
    { opacity: 0, scale: 0.6 },
    {
      opacity: 1,
      scale: 1,
      duration: DUR_SM,
      ease: EASE_BOUNCE,
      delay,
      clearProps: "all",
    },
  );
}

// ── Shake (wrong answer feedback) ─────────────────────────────────────────
export function shake(el: Element | null) {
  if (!el) return;
  gsap.fromTo(
    el,
    { x: 0 },
    {
      x: 10,
      duration: 0.07,
      ease: "power1.inOut",
      yoyo: true,
      repeat: 5,
      clearProps: "x",
    },
  );
}

// ── Slide-in from right ────────────────────────────────────────────────────
export function slideInRight(el: Element | null, delay = 0) {
  if (!el) return;
  gsap.fromTo(
    el,
    { opacity: 0, x: 40 },
    {
      opacity: 1,
      x: 0,
      duration: DUR_SM,
      ease: EASE_OUT,
      delay,
      clearProps: "all",
    },
  );
}

// ── Slide-in from left ─────────────────────────────────────────────────────
export function slideInLeft(el: Element | null, delay = 0) {
  if (!el) return;
  gsap.fromTo(
    el,
    { opacity: 0, x: -40 },
    {
      opacity: 1,
      x: 0,
      duration: DUR_SM,
      ease: EASE_OUT,
      delay,
      clearProps: "all",
    },
  );
}

// ── Re-export gsap instance ────────────────────────────────────────────────
export { gsap };
