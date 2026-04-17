"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/*+=-_";

// Scramble is structured in two phases so it reads as "corruption → recovery":
//   1) HOLD phase  : every glyph stays randomised (frame < SCRAMBLE_HOLD_FRAMES).
//                    Gives the swap a clearly visible "broken" moment before
//                    characters start locking in.
//   2) REVEAL phase: glyphs resolve left-to-right, one per frame.
// Total frames  = HOLD + text.length + tail (extra wobble after last char).
const SCRAMBLE_HOLD_FRAMES = 5;
const SCRAMBLE_TAIL_FRAMES = 3;
// Frame cadence of the scramble animation. At 30ms the worst-case 9-char
// word (TECHNICAL) finishes in ~510ms and 6-char (HONGSU) in ~420ms, which
// fits the 2s-intro stage 2c window (500ms) without visibly overshooting.
const SCRAMBLE_FRAME_MS = 30;

// 글리치 루프 (GLITCH LOOP) window after a text swap. During this window:
//   - the <h1> wears `.is-swap-glitch` (mirrors `.is-hovered` visuals:
//     heroGlitch jitter animation + stronger text-shadow).
//   - each line wears `.is-swapping` while its scramble is still running,
//     which re-enables the RGB slice ghosts + breakShake that are normally
//     gated on `.is-settled`. This way the swap moment shows the same
//     "reactive" costume you see on hover / pulse.
// Matched to the 3s intro's stage 2c span (800ms). The scramble itself
// finishes in ~420-510ms, so the remaining ~300ms keeps the slice/jitter
// loop running over the already-settled new title before it hands off to
// the brief hold and emission.
const SWAP_GLITCH_MS = 800;

type HeroAnimatedTitleProps = {
  lines: string[];
  className?: string;
  startDelayMs?: number;
  lineStaggerMs?: number;
  hovered?: boolean;
};

function glyphForIndex(index: number, frame: number) {
  // Deterministic linear shift: each frame, every column advances by 7
  // glyphs. This gives the scramble its characteristic "rolling ticker"
  // cadence — glyphs feel like they march through the slot rather than
  // flickering randomly. Keep deterministic so SSR/CSR initial renders match.
  const glyphIndex = (index * 13 + frame * 7) % GLYPHS.length;
  return GLYPHS[glyphIndex];
}

function scrambleText(target: string, frame: number) {
  const revealFrame = frame - SCRAMBLE_HOLD_FRAMES;
  return target
    .split("")
    .map((char, index) => {
      if (char === " ") {
        return " ";
      }
      // During HOLD (revealFrame < 0) every glyph is noise. After HOLD, glyphs
      // before `revealFrame` lock in as the target character.
      return index < revealFrame ? char : glyphForIndex(index, frame);
    })
    .join("");
}

function randomGlyph() {
  return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
}

function hoverScramble(target: string, rate: number) {
  return target
    .split("")
    .map((char) => {
      if (char === " ") {
        return " ";
      }
      return Math.random() < rate ? randomGlyph() : char;
    })
    .join("");
}

type AnimatedLineProps = {
  text: string;
  startDelayMs: number;
  hovered: boolean;
  /**
   * True when this line was mounted as a result of a text swap (not the
   * initial reveal). Enables the `is-swapping` class on the element so the
   * RGB slice ghosts + break shake animate while the scramble is running.
   */
  isSwap?: boolean;
};

function AnimatedLine({ text, startDelayMs, hovered, isSwap = false }: AnimatedLineProps) {
  const [displayText, setDisplayText] = useState(() => scrambleText(text, 0));
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    let frame = 0;
    let intervalId: number | undefined;
    const totalFrames =
      SCRAMBLE_HOLD_FRAMES + text.replace(/\s/g, "").length + SCRAMBLE_TAIL_FRAMES;

    const timeoutId = window.setTimeout(() => {
      intervalId = window.setInterval(() => {
        frame += 1;
        setDisplayText(scrambleText(text, frame));

        if (frame >= totalFrames) {
          if (intervalId) {
            window.clearInterval(intervalId);
          }
          setDisplayText(text);
          setSettled(true);
        }
      }, SCRAMBLE_FRAME_MS);
    }, startDelayMs);

    return () => {
      window.clearTimeout(timeoutId);
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [startDelayMs, text]);

  useEffect(() => {
    if (!settled) {
      return;
    }

    if (!hovered) {
      setDisplayText(text);
      return;
    }

    let tick = 0;
    const intervalId = window.setInterval(() => {
      tick += 1;
      if (tick % 4 === 0) {
        setDisplayText(text);
      } else {
        const rate = 0.22 + Math.random() * 0.28;
        setDisplayText(hoverScramble(text, rate));
      }
    }, 70);

    return () => {
      window.clearInterval(intervalId);
      setDisplayText(text);
    };
  }, [hovered, settled, text]);

  const classes = [
    "hero-assemble__line",
    settled ? "is-settled" : "",
    hovered && settled ? "is-breaking" : "",
    // 글리치 루프 during swap scramble: while the line hasn't settled yet
    // AND this mount is from a swap (not initial reveal), expose the slice
    // ghosts + break shake via CSS.
    !settled && isSwap ? "is-swapping" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes} data-text={text}>
      <span className="hero-assemble__text" data-text={text}>
        {displayText}
      </span>
    </span>
  );
}

export function HeroAnimatedTitle({
  lines,
  className,
  startDelayMs = 0,
  lineStaggerMs = 260,
  hovered = false,
}: HeroAnimatedTitleProps) {
  const concatenated = useMemo(() => lines.join(" "), [lines]);
  // `startDelayMs` and `lineStaggerMs` are meant for the *initial* reveal
  // (staggered line-by-line scramble into place). When the parent swaps
  // `lines` mid-flight, the inner `AnimatedLine`s remount via key change —
  // we want that scramble to fire immediately, without holding on the old
  // text for the original delay. After the first paint we flip this ref so
  // every subsequent remount bypasses the reveal timing.
  const isInitialRenderRef = useRef(true);
  useEffect(() => {
    isInitialRenderRef.current = false;
  }, []);
  const isInitial = isInitialRenderRef.current;
  const effectiveStart = isInitial ? startDelayMs : 0;
  const effectiveStagger = isInitial ? lineStaggerMs : 0;

  // 글리치 루프 window: activates for SWAP_GLITCH_MS each time `lines`
  // content changes after the initial render. Drives `.is-swap-glitch` on
  // the <h1> so the jitter / shadow loop mirrors the hover state for the
  // duration of the scramble.
  const [inSwapGlitch, setInSwapGlitch] = useState(false);
  const hasSeenFirstLinesEffectRef = useRef(false);
  useEffect(() => {
    if (!hasSeenFirstLinesEffectRef.current) {
      hasSeenFirstLinesEffectRef.current = true;
      return;
    }
    setInSwapGlitch(true);
    const id = window.setTimeout(() => setInSwapGlitch(false), SWAP_GLITCH_MS);
    return () => window.clearTimeout(id);
  }, [lines]);

  const h1Class = [
    className ?? "",
    "hero-assemble",
    hovered ? "is-hovered" : "",
    inSwapGlitch ? "is-swap-glitch" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <h1 className={h1Class} data-text={concatenated}>
      {lines.map((line, index) => (
        <AnimatedLine
          key={`${line}-${index}`}
          text={line}
          startDelayMs={effectiveStart + index * effectiveStagger}
          hovered={hovered}
          isSwap={!isInitial}
        />
      ))}
    </h1>
  );
}
