"use client";

import { useEffect, useState } from "react";

type HeroControllerProps = {
  onProgressChange?: (progress: number) => void;
};

export function HeroController({ onProgressChange }: HeroControllerProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const max = Math.max(1, window.innerHeight);
      const next = Math.min(1, window.scrollY / max);
      setProgress(next);
      onProgressChange?.(next);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [onProgressChange]);

  return (
    <div className="muted" style={{ position: "absolute", bottom: 16, right: 16, fontSize: 12 }}>
      hero progress: {progress.toFixed(2)}
    </div>
  );
}
