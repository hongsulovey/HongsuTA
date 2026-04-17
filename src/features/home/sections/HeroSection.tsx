"use client";

import dynamic from "next/dynamic";
import type { PointerEvent as ReactPointerEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { HeroAmbientGlyphs } from "@/features/home/components/HeroAmbientGlyphs";
import { HeroController } from "@/features/home/components/HeroController";
import { HeroIntro } from "@/features/home/components/HeroIntro";
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

// Heavy three.js / R3F stack (~500 KB min+gz). Lazy-loaded in its own chunk
// so the rest of the hero (DOM overlay, nav, glyphs) can hydrate first.
// The placeholder reproduces the exact gradient the Canvas wrapper renders,
// so there is no visible flash while the chunk streams in.
const HeroCanvas = dynamic(
  () => import("@/features/home/components/HeroCanvas").then((mod) => mod.HeroCanvas),
  {
    ssr: false,
    loading: () => (
      <div
        className="hero-canvas"
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(145deg, #0b101a, #0d1118)",
        }}
      />
    ),
  }
);

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

const DEFAULT_POINTER = { x: 0.5, y: 0.42 };

// Title loop: alternates between the two variants using the existing
// scramble + 글리치 루프. Timeline anchored to the 3.0-second hero intro:
//  - cycle 0 (page load)              : `TECHNICAL ARTIST`.
//  - cycle 1 (1.4s into intro, t=0.467): first swap to `CHOI HONGSU`. This
//                                       lands inside intro stage 2c (800ms
//                                       window) where the curtain is still
//                                       black, so the 글리치 루프 + scramble
//                                       play cleanly on black before stage 3
//                                       emission (t=0.767, 2300ms) grabs the
//                                       new text. A PULSE fires here too —
//                                       the shader RGB split / ambient ripple
//                                       bleed in under the curtain.
//  - cycle 2+ (post-intro, every 5s)  : alternates. Each swap fires a PULSE
//                                       from the title region so the radial
//                                       glitch, shader RGB split and scramble
//                                       transition all happen in sync.
const TITLE_VARIANTS: string[][] = [
  ["TECHNICAL", "ARTIST"],
  ["CHOI", "HONGSU"],
];
const FIRST_TITLE_SWAP_MS = 1400;
const TITLE_SWAP_INTERVAL_MS = 5000;
// Normalised origin for the programmatic PULSE triggered by each title swap.
// Roughly aligned with the on-screen title baseline (left-of-centre, upper-mid).
const TITLE_SWAP_PULSE_ORIGIN = { x: 0.32, y: 0.46 };

export function HeroSection() {
  const [progress, setProgress] = useState(0);
  const [isTitleHovered, setIsTitleHovered] = useState(false);
  const [isBackgroundPulseActive, setIsBackgroundPulseActive] = useState(false);
  const [pulse, setPulse] = useState<BackgroundPulse | null>(null);
  const [pointer, setPointer] = useState(DEFAULT_POINTER);
  const [titleCycle, setTitleCycle] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
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

  // "PULSE" = the radial glitch triggered by clicking an empty area of the
  // hero. Propagates through the shader (RGB split), the ambient glyph layer
  // (per-glyph ripple), and the title overlay (reactive state amp).
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

  // Programmatic PULSE fired from a normalised origin inside the hero-shell.
  // Used by the title-cycle timer so every post-intro swap triggers exactly
  // the same visual language as a user click.
  const firePulseAt = useCallback((normX: number, normY: number) => {
    const el = sectionRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const clientX = rect.left + rect.width * normX;
    const clientY = rect.top + rect.height * normY;
    triggerBackgroundPulse(clientX, clientY, rect);
  }, [triggerBackgroundPulse]);

  // Title cycle timer. Every automatic swap — including the first one that
  // happens mid-intro — fires a PULSE from the title region so the scramble
  // transition and the radial glitch always run together. The intro's own
  // stage timeline (black → emission → whiteout → return) continues to play
  // on top; the first PULSE simply rides along with stage 3.
  useEffect(() => {
    let intervalId: number | null = null;
    const tick = () => {
      setTitleCycle((n) => n + 1);
      firePulseAt(TITLE_SWAP_PULSE_ORIGIN.x, TITLE_SWAP_PULSE_ORIGIN.y);
    };
    const timeoutId = window.setTimeout(() => {
      tick();
      intervalId = window.setInterval(tick, TITLE_SWAP_INTERVAL_MS);
    }, FIRST_TITLE_SWAP_MS);
    return () => {
      window.clearTimeout(timeoutId);
      if (intervalId !== null) window.clearInterval(intervalId);
    };
  }, [firePulseAt]);

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

  // Stabilise references passed into the (memo-friendly) HeroCanvas so that
  // unrelated state flips (hovered / pulseActive) don't invalidate the
  // pulsePointer object identity and force extra prop-diff work downstream.
  const pulsePointer = useMemo(
    () => (pulse ? { x: pulse.x, y: pulse.y } : pointer),
    [pulse, pointer]
  );
  const highlight = isTitleHovered ? 1 : 0;
  const pulseValue = isBackgroundPulseActive ? 1 : 0;
  const titleLines = TITLE_VARIANTS[titleCycle % TITLE_VARIANTS.length];

  return (
    <section
      ref={sectionRef}
      className="hero-shell"
      onPointerMove={handlePointerMove}
      onPointerDown={handleBackgroundPointerDown}
    >
      <HeroCanvas
        progress={progress}
        pointer={pointer}
        highlight={highlight}
        hovered={isTitleHovered}
        pulse={pulseValue}
        pulsePointer={pulsePointer}
      />
      <HeroAmbientGlyphs hovered={isTitleHovered} pulse={pulse} />
      <div className="hero-shell__shade" />
      <HeroOverlay hovered={isReactive} lines={titleLines} />
      <HeroIntro lines={titleLines} cycleIndex={titleCycle} />
      <HeroController onProgressChange={setProgress} />
    </section>
  );
}
