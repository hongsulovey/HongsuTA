"use client";

import { useEffect } from "react";

type HeroControllerProps = {
  onProgressChange?: (progress: number) => void;
};

export function HeroController({ onProgressChange }: HeroControllerProps) {
  useEffect(() => {
    const handleScroll = () => {
      const max = Math.max(1, window.innerHeight);
      const next = Math.min(1, window.scrollY / max);
      onProgressChange?.(next);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [onProgressChange]);

  return null;
}
