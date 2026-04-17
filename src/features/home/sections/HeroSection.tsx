"use client";

import type { PointerEvent as ReactPointerEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { HeroAmbientGlyphs } from "@/features/home/components/HeroAmbientGlyphs";
import { HeroCanvas } from "@/features/home/components/HeroCanvas";
import { HeroController } from "@/features/home/components/HeroController";
import { HeroOverlay } from "@/features/home/components/HeroOverlay";
import { useUiHoverListener } from "@/shared/hooks/useUiHoverTrigger";

/**
 * Hero section orchestrator.
 *
 * Responsibilities:
 *  - Collects pointer / hover / click state for the hero area.
 *  - Passes derived values into the R3F canvas, ambient glyph layer and
 *    DOM overlay. Individual visual systems read from these props and
 *    do not talk to each other directly.
 *
 * Interaction model:
 *  - `pointer`             : normalised (0..1) cursor position inside the section,
 *                            used by shaders for subtle pointer-aware distortion.
 *  - `isTitleHovered`      : raised by nav / buttons / title via `useUiHoverTrigger`;
 *                            drives the glitch-heavy "reactive" state across layers.
 *  - `pulse` / `pulseActive`: emitted when the user left-clicks an empty area of the
 *                            hero (background click). Triggers the radial glitch.
 */

type BackgroundPulse = {
  key: number;
  x: number;
  y: number;
  clientX: number;
  clientY: number;
};

// How long the background-click pulse stays "active" before relaxing back
// to idle. Kept short so repeated clicks feel snappy.
const PULSE_ACTIVE_MS = 680;

// Selector used to decide which DOM targets should NOT trigger a background
// pulse when clicked (they have their own hover-driven reactions instead).
const INTERACTIVE_SELECTOR = "a, button, input, textarea, select, label";

export function HeroSection() {
  const [progress, setProgress] = useState(0);
  const [isTitleHovered, setIsTitleHovered] = useState(false);
  const [isBackgroundPulseActive, setIsBackgroundPulseActive] = useState(false);
  const [pulse, setPulse] = useState<BackgroundPulse | null>(null);
  const [pointer, setPointer] = useState({ x: 0.5, y: 0.42 });
  const pulseTimeoutRef = useRef<number | null>(null);
  const pulseKeyRef = useRef(0);
  // rAF-coalesce pointer updates: pointermove can fire 100-1000Hz on
  // high-refresh displays, but the shader only needs one update per frame.
  const pendingPointerRef = useRef<{ x: number; y: number } | null>(null);
  const pointerRafRef = useRef<number | null>(null);

  useUiHoverListener(setIsTitleHovered);

  useEffect(() => {
    return () => {
      if (pulseTimeoutRef.current !== null) {
        window.clearTimeout(pulseTimeoutRef.current);
      }
      if (pointerRafRef.current !== null) {
        cancelAnimationFrame(pointerRafRef.current);
      }
    };
  }, []);

  const triggerBackgroundPulse = useCallback((clientX: number, clientY: number, rect: DOMRect) => {
    const x = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const y = Math.min(1, Math.max(0, (clientY - rect.top) / rect.height));
    pulseKeyRef.current += 1;
    setPulse({ key: pulseKeyRef.current, x, y, clientX, clientY });
    setIsBackgroundPulseActive(true);
    setPointer({ x, y });

    if (pulseTimeoutRef.current !== null) {
      window.clearTimeout(pulseTimeoutRef.current);
    }

    pulseTimeoutRef.current = window.setTimeout(() => {
      setIsBackgroundPulseActive(false);
      pulseTimeoutRef.current = null;
    }, PULSE_ACTIVE_MS);
  }, []);

  const isReactive = isTitleHovered || isBackgroundPulseActive;

  const handlePointerMove = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    pendingPointerRef.current = {
      x: Math.min(1, Math.max(0, x)),
      y: Math.min(1, Math.max(0, y)),
    };

    if (pointerRafRef.current !== null) {
      return;
    }
    pointerRafRef.current = requestAnimationFrame(() => {
      pointerRafRef.current = null;
      const next = pendingPointerRef.current;
      if (next) {
        setPointer(next);
      }
    });
  }, []);

  const handleBackgroundPointerDown = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    if (event.button !== 0) {
      return;
    }

    const target = event.target as HTMLElement;
    if (target.closest(INTERACTIVE_SELECTOR)) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    triggerBackgroundPulse(event.clientX, event.clientY, rect);
  }, [triggerBackgroundPulse]);

  return (
    <section className="hero-shell" onPointerMove={handlePointerMove} onPointerDown={handleBackgroundPointerDown}>
      <HeroCanvas
        progress={progress}
        pointer={pointer}
        highlight={isTitleHovered ? 1 : 0}
        hovered={isTitleHovered}
        pulse={isBackgroundPulseActive ? 1 : 0}
        pulsePointer={pulse ? { x: pulse.x, y: pulse.y } : pointer}
      />
      <HeroAmbientGlyphs hovered={isTitleHovered} pulse={pulse} />
      <div className="hero-shell__shade" />
      <HeroOverlay hovered={isReactive} />
      <HeroController onProgressChange={setProgress} />
    </section>
  );
}
