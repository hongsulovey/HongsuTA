"use client";

import Link from "next/link";
import { HeroAnimatedTitle } from "@/features/home/components/HeroAnimatedTitle";
import { homeContent } from "@/features/home/data/homeContent";
import { useUiHoverTrigger } from "@/shared/hooks/useUiHoverTrigger";

type HeroOverlayProps = {
  hovered?: boolean;
};

export function HeroOverlay({ hovered = false }: HeroOverlayProps) {
  const hoverProps = useUiHoverTrigger();

  return (
    <div className="hero-overlay">
      <div className="hero-overlay__content">
        <p className="muted hero-overlay__eyebrow hero-fade-up" style={{ animationDelay: "120ms" }}>
          {homeContent.role}
        </p>
        <HeroAnimatedTitle
          lines={homeContent.headlineLines}
          className="hero-overlay__title"
          startDelayMs={260}
          lineStaggerMs={220}
          hovered={hovered}
        />
        <p className="muted hero-overlay__tagline hero-fade-up" style={{ animationDelay: "620ms" }}>
          {homeContent.tagline}
        </p>
        <div className="hero-overlay__actions hero-fade-up glitch-cluster" style={{ animationDelay: "760ms" }}>
          <Link
            href="/projects"
            className="btn hero-glass-button hero-glitch-hover"
            data-text="View Projects"
            {...hoverProps}
          >
            <span className="hero-glitch-hover__label">View Projects</span>
          </Link>
          <Link
            href="/contact"
            className="btn hero-glass-button hero-glitch-hover"
            data-text="Contact"
            {...hoverProps}
          >
            <span className="hero-glitch-hover__label">Contact</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
