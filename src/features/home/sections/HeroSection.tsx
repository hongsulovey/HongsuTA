"use client";

import type { PointerEvent as ReactPointerEvent } from "react";
import { useCallback, useState } from "react";
import { HeroAmbientGlyphs } from "@/features/home/components/HeroAmbientGlyphs";
import { HeroCanvas } from "@/features/home/components/HeroCanvas";
import { HeroController } from "@/features/home/components/HeroController";
import { HeroOverlay } from "@/features/home/components/HeroOverlay";
import { useUiHoverListener } from "@/shared/hooks/useUiHoverTrigger";

export function HeroSection() {
  const [progress, setProgress] = useState(0);
  const [isTitleHovered, setIsTitleHovered] = useState(false);
  const [pointer, setPointer] = useState({ x: 0.5, y: 0.42 });

  useUiHoverListener(setIsTitleHovered);

  const handlePointerMove = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    setPointer({
      x: Math.min(1, Math.max(0, x)),
      y: Math.min(1, Math.max(0, y)),
    });
  }, []);

  return (
    <section className="hero-shell" onPointerMove={handlePointerMove}>
      <HeroCanvas
        progress={progress}
        pointer={pointer}
        highlight={isTitleHovered ? 1 : 0}
        hovered={isTitleHovered}
      />
      <HeroAmbientGlyphs hovered={isTitleHovered} />
      <div className="hero-shell__shade" />
      <HeroOverlay hovered={isTitleHovered} />
      <HeroController onProgressChange={setProgress} />
    </section>
  );
}
