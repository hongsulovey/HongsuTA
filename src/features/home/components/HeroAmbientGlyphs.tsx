"use client";

import { useEffect, useMemo, useState } from "react";

const GLYPHS = "01<>[]{}+=-_/\\*#";

type GlyphParticle = {
  glyph: string;
  left: string;
  delay: string;
  duration: string;
  size: string;
  opacity: number;
};

function pseudoRandom(seed: number) {
  const value = Math.sin(seed * 999.97) * 43758.5453;
  return value - Math.floor(value);
}

function makeGlyphParticle(index: number): GlyphParticle {
  const glyph = GLYPHS[index % GLYPHS.length];
  const left = `${pseudoRandom(index + 1) * 100}%`;
  const delay = `${pseudoRandom(index + 7) * 3.5}s`;
  const duration = `${8 + pseudoRandom(index + 13) * 9}s`;
  const size = `${0.65 + pseudoRandom(index + 17) * 0.55}rem`;
  const opacity = 0.18 + pseudoRandom(index + 21) * 0.28;

  return { glyph, left, delay, duration, size, opacity };
}

type HeroAmbientGlyphsProps = {
  hovered?: boolean;
};

export function HeroAmbientGlyphs({ hovered = false }: HeroAmbientGlyphsProps) {
  const [mounted, setMounted] = useState(false);
  const particles = useMemo(
    () => Array.from({ length: 96 }, (_, index) => makeGlyphParticle(index)),
    []
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div
      className={`hero-glyphs ${hovered ? "is-collapsing" : ""}`.trim()}
      aria-hidden
    >
      {particles.map((particle, index) => (
        <span
          key={`${particle.glyph}-${index}`}
          className="hero-glyphs__item"
          style={{
            left: particle.left,
            animationDelay: particle.delay,
            animationDuration: particle.duration,
            fontSize: particle.size,
            opacity: particle.opacity,
          }}
        >
          {particle.glyph}
        </span>
      ))}
    </div>
  );
}
