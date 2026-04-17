"use client";

import { useEffect, useMemo, useRef, useState } from "react";

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
  pulse?: {
    key: number;
    x: number;
    y: number;
    clientX: number;
    clientY: number;
  } | null;
};

export function HeroAmbientGlyphs({ hovered = false, pulse = null }: HeroAmbientGlyphsProps) {
  const [mounted, setMounted] = useState(false);
  const itemRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const particles = useMemo(
    () => Array.from({ length: 96 }, (_, index) => makeGlyphParticle(index)),
    []
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!pulse) {
      return;
    }

    const maxDistance = Math.hypot(window.innerWidth, window.innerHeight) * 0.18;

    // Pass 1: read-only — compute all deltas in a single batch so the browser
    // does one layout pass instead of thrashing read/write 96 times.
    type Update = {
      element: HTMLSpanElement;
      inRange: boolean;
      delay: number;
      strength: number;
      shiftX: number;
      shiftY: number;
    };
    const updates: Update[] = [];
    for (const element of itemRefs.current) {
      if (!element) continue;
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width * 0.5;
      const centerY = rect.top + rect.height * 0.5;
      const dx = centerX - pulse.clientX;
      const dy = centerY - pulse.clientY;
      const distance = Math.hypot(dx, dy);
      if (distance > maxDistance) {
        updates.push({ element, inRange: false, delay: 0, strength: 0, shiftX: 0, shiftY: 0 });
        continue;
      }
      const distanceRatio = Math.min(distance / maxDistance, 1);
      const strength = Math.max(0.18, 1 - distanceRatio);
      const shiftX = Math.max(-10, Math.min(10, (dx / Math.max(distance, 1)) * (6 + strength * 6)));
      const shiftY = Math.max(-10, Math.min(10, (dy / Math.max(distance, 1)) * (5 + strength * 5)));
      updates.push({
        element,
        inRange: true,
        delay: distanceRatio * 220,
        strength,
        shiftX,
        shiftY,
      });
    }

    // Pass 2a: write all style vars + remove is-rippled (no layout reads).
    for (const u of updates) {
      if (u.inRange) {
        u.element.style.setProperty("--pulse-delay", `${u.delay}ms`);
        u.element.style.setProperty("--pulse-strength", u.strength.toFixed(3));
        u.element.style.setProperty("--pulse-shift-x", `${u.shiftX.toFixed(2)}px`);
        u.element.style.setProperty("--pulse-shift-y", `${u.shiftY.toFixed(2)}px`);
      }
      u.element.classList.remove("is-rippled");
    }

    // Single reflow to restart CSS animation for every newly-rippled element.
    // One forced layout instead of 96.
    if (updates.length > 0 && updates[0].element.parentElement) {
      void updates[0].element.parentElement.offsetWidth;
    }

    // Pass 2b: add is-rippled class to in-range elements.
    for (const u of updates) {
      if (u.inRange) {
        u.element.classList.add("is-rippled");
      }
    }
  }, [pulse]);

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
          data-glyph={particle.glyph}
          ref={(node) => {
            itemRefs.current[index] = node;
          }}
          style={{
            left: particle.left,
            fontSize: particle.size,
            opacity: particle.opacity,
            ["--glyph-delay" as string]: particle.delay,
            ["--glyph-duration" as string]: particle.duration,
          }}
        >
          {particle.glyph}
        </span>
      ))}
    </div>
  );
}
