"use client";

import { useEffect } from "react";

type HeroControllerProps = {
  onProgressChange?: (progress: number) => void;
};

export function HeroController({ onProgressChange }: HeroControllerProps) {
  useEffect(() => {
    // Coalesce scroll events to at most one progress update per frame.
    // Scroll listeners can fire dozens of times per frame on some devices;
    // React state updates beyond 1/frame are wasted work for downstream R3F.
    let rafId: number | null = null;

    const compute = () => {
      rafId = null;
      const max = Math.max(1, window.innerHeight);
      const next = Math.min(1, window.scrollY / max);
      onProgressChange?.(next);
    };

    const schedule = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(compute);
    };

    compute();
    window.addEventListener("scroll", schedule, { passive: true });
    return () => {
      window.removeEventListener("scroll", schedule);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [onProgressChange]);

  return null;
}
