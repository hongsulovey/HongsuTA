"use client";

import { useEffect, useRef, useState } from "react";
import { HeroAnimatedTitle } from "@/features/home/components/HeroAnimatedTitle";
import { homeContent } from "@/features/home/data/homeContent";

/**
 * Cinematic one-shot intro for the hero section.
 *
 * Timeline (t ∈ [0, 1] over INTRO_DURATION_MS = 5.0s):
 *   1)   0.000–0.060  full black (0-300ms)
 *   2ab) 0.060–0.280  TECHNICAL ARTIST scrambles in + long hold on black
 *                     (300-1400ms). Scramble finishes around 810ms, leaving
 *                     a visible pause where the text just pulses under the
 *                     text-shaped glitch before the swap.
 *   2c)  0.280–0.440  글리치 루프 → CHOI HONGSU swap (1400-2200ms). Parent
 *                     fires its first title swap at 1400ms (t=0.28).
 *                     SWAP_GLITCH_MS (800) is matched to this stage length,
 *                     so the slice/jitter loop covers the whole window even
 *                     after the scramble itself resolves.
 *   3)   0.440–0.520  Calm: still black + text + text-shaped glitch. All
 *                     emission / aura / global-glitch / scanline curves are
 *                     hard-zeroed so the view stays "just like stage 2" —
 *                     breath moment before the final storm (2200-2600ms).
 *   4a)  0.520–0.540  Return glitch ramp-up (2600-2700ms, 100ms).
 *   4b)  0.540–0.605  Strong full-screen 글리치 루프 PLATEAU on black
 *                     (2700-3025ms, 325ms at full strength).
 *   4c)  0.605–0.630  Return glitch fade-out (3025-3150ms, 125ms).
 *                     Total return-glitch ~550ms — 35% shorter than
 *                     the previous 850ms pass.
 *   4d)  0.630–0.940  Close-in: the dark scan bands (irregular, 3 coprime
 *                     periods) progressively widen until their black
 *                     coverage fills the entire viewport. Starts right
 *                     where returnGlitch ends so the transition reads as
 *                     continuous rather than having a limbo gap
 *                     (3150-4700ms, 1550ms).
 *   4e)  0.940–1.000  Pure black hold (4700-5000ms). At t=1.0 the intro
 *                     unmounts in a single frame and the real hero appears
 *                     "짠" from behind the black.
 *
 * Design choices:
 *   - Fully self-contained overlay. Removing `<HeroIntro />` from the hero
 *     section restores the site to pre-intro behaviour with zero side effects.
 *   - A single `requestAnimationFrame` loop drives the CSS custom properties
 *     via direct DOM mutation, so React re-renders are avoided at 60 fps.
 *   - Plays on every page load (including refreshes). Respects
 *     `prefers-reduced-motion`. Append `?intro=0` to the URL to skip intro
 *     (useful while developing deeper pages without waiting each reload).
 */

const INTRO_DURATION_MS = 5000;

/** Hermite smoothstep — produces clean ease-in/out between two edges. */
function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/** All stage intensities in [0, 1], derived purely from `introProgress`. */
function computeStages(t: number) {
  // Stage layout (5.0s total). See file header for the full narrative.

  // Black curtain is held fully opaque for the entire intro. The main
  // hero only becomes visible when <HeroIntro /> unmounts at t = 1.0 —
  // that unmount is the "짠" snap the user asked for.
  const black = 1;
  const hole = 0;

  // Title fades in during stage 1 and is held at full opacity all the way
  // to the unmount (no late decay) so the snap is a hard cut, not a
  // cross-fade. Absolute timing preserved from the original cut: ~300→600ms.
  const title = smoothstep(0.06, 0.12, t);

  // Emission / aura / glow / stage-3 glitch / scanlines are intentionally
  // disabled: the view must read as "black + text + text-shaped glitch"
  // (i.e. like stage 2) through stages 3 and 4. Keeping the return names
  // in the shape means downstream CSS selectors that read these vars still
  // work — they just receive 0.
  const glow = 0;
  const aura = 0;
  const glitch = 0;
  const scan = 0;
  const flash = 0;

  // Text-shaped glitch ticks on from stage 1 through the whole intro. No
  // late decay — the RGB slices keep running right up to the unmount snap.
  // Absolute timing preserved: ~360→680ms.
  const titleGlitchStrong = smoothstep(0.072, 0.136, t);

  // Stage 4: strong full-screen 글리치 루프 on the black background.
  //   ramp     0.52 → 0.54    = 100ms
  //   PLATEAU  0.54 → 0.605   = 325ms at full strength
  //   fade-out 0.605 → 0.63   = 125ms (glitch dies, close-in takes over)
  // Total ~550ms — 35 % shorter than the previous 850 ms pass.
  const returnGlitch =
    smoothstep(0.52, 0.54, t) * (1 - smoothstep(0.605, 0.63, t));

  const titleGlitch = Math.min(1, titleGlitchStrong + returnGlitch * 0.7);

  // Close-in progress: 0 = thin irregular black stripes (plateau look),
  // 1 = every stripe has widened to fill its period, the stacked multiply
  // layers collapse the viewport to solid black. Starts where
  // returnGlitch finishes fading so the two phases chain without a gap.
  //   0.63 → 0.94   = 1550ms of irregular stripe growth
  //   0.94 → 1.00   = 300ms of pure black hold before the snap
  const closeDepth = smoothstep(0.63, 0.94, t);

  // Dark scan bands want to stay visible through the whole stage-4 window
  // even after returnGlitch has faded — they're what's carrying the image
  // from "glitch + 30% black stripes" all the way to "solid black". So we
  // drive them from a dedicated curve that ramps in with the plateau and
  // never fades; the intro's unmount at t=1 is what ends them.
  const scanDark = smoothstep(0.52, 0.54, t);

  return {
    black,
    hole,
    title,
    titleGlitch,
    glow,
    aura,
    glitch,
    returnGlitch,
    scan,
    flash,
    closeDepth,
    scanDark,
  };
}

type IntroStages = ReturnType<typeof computeStages>;

const INTRO_VAR_KEYS: (keyof IntroStages)[] = [
  "black",
  "hole",
  "title",
  "titleGlitch",
  "glow",
  "aura",
  "glitch",
  "returnGlitch",
  "scan",
  "flash",
  "closeDepth",
  "scanDark",
];

const CSS_VAR_NAMES: Record<keyof IntroStages, string> = {
  black: "--intro-black",
  hole: "--intro-hole",
  title: "--intro-title",
  titleGlitch: "--intro-title-glitch",
  glow: "--intro-glow",
  aura: "--intro-aura",
  glitch: "--intro-glitch",
  returnGlitch: "--intro-return-glitch",
  scan: "--intro-scan",
  flash: "--intro-flash",
  closeDepth: "--intro-close-depth",
  scanDark: "--intro-scan-dark",
};

/** Writes intro CSS variables; skips setProperty when the rounded value is unchanged. */
function applyIntroStageVars(
  el: HTMLElement,
  stages: IntroStages,
  prev: Map<string, string>
) {
  for (const key of INTRO_VAR_KEYS) {
    const cssName = CSS_VAR_NAMES[key];
    const next = stages[key].toFixed(4);
    if (prev.get(cssName) === next) continue;
    prev.set(cssName, next);
    el.style.setProperty(cssName, next);
  }
}

function shouldPlayIntro(): boolean {
  if (typeof window === "undefined") return false;

  // Respect OS-level reduced-motion preference.
  const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return false;

  // Opt-out escape hatch: `?intro=0` skips the intro for faster iteration on
  // deeper sections of the site. Any other value (or no param) runs the intro.
  const param = new URLSearchParams(window.location.search).get("intro");
  if (param === "0") return false;

  // Otherwise always play — including on every refresh / navigation back to
  // the homepage. No session-level suppression.
  return true;
}

type HeroIntroProps = {
  /** Currently visible title lines. Follows the parent's cycling variant. */
  lines?: string[];
  /**
   * Zero on first mount; increments every time the parent swaps variants.
   * We use it to decide whether the core scramble should be delayed (first
   * reveal during stage 2) or fire immediately (mid-intro swap on cycle→1).
   */
  cycleIndex?: number;
};

export function HeroIntro({ lines, cycleIndex = 0 }: HeroIntroProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const introVarsPrevRef = useRef<Map<string, string>>(new Map());
  const titleLines = lines ?? homeContent.headlineLines;
  const titleText = titleLines.join(" ");
  // Delay the very first scramble so it visibly resolves during stage 2
  // (curtain fully black until ~420ms). Mid-intro swaps re-mount the inner
  // AnimatedLine via key change and should scramble immediately.
  const coreStartDelayMs = cycleIndex === 0 ? 420 : 0;

  useEffect(() => {
    if (!shouldPlayIntro()) return;

    setIsPlaying(true);
    introVarsPrevRef.current.clear();

    let rafId = 0;
    let done = false;
    const start = performance.now();

    const finish = () => {
      if (done) return;
      done = true;
      // One extra frame at t=1 is already applied; schedule unmount on next task
      // so React doesn't race with the final style write.
      window.setTimeout(() => setIsPlaying(false), 60);
    };

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / INTRO_DURATION_MS);
      const stages = computeStages(progress);

      const el = rootRef.current;
      if (el) {
        applyIntroStageVars(el, stages, introVarsPrevRef.current);
      }

      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        finish();
      }
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      introVarsPrevRef.current.clear();
    };
  }, []);

  if (!isPlaying) return null;

  return (
    <div className="hero-intro" aria-hidden ref={rootRef}>
      <div className="hero-intro__layer hero-intro__black" />
      <div className="hero-intro__layer hero-intro__title-emitter">
        <div className="hero-intro__emit-wrap">
          {/* Core glyphs: scramble-driven so each cycle swap replays the
              existing strong glitch transition via AnimatedLine remount. */}
          <HeroAnimatedTitle
            lines={titleLines}
            className="hero-overlay__title hero-intro__emit hero-intro__emit--core"
            startDelayMs={coreStartDelayMs}
            lineStaggerMs={0}
            hovered
          />
          <div className="hero-intro__emit-spacer" />
          {/* Near / far halo layers stay static — they're heavily blurred so
              an instant text swap just reads as a shape change of the glow. */}
          <h1 className="hero-overlay__title hero-intro__emit hero-intro__emit--near" data-text={titleText}>
            {titleLines.map((line, index) => (
              <span key={`near-${line}-${index}`} className="hero-assemble__line is-settled" data-text={line}>
                <span className="hero-assemble__text" data-text={line}>
                  {line}
                </span>
              </span>
            ))}
          </h1>
          <h1 className="hero-overlay__title hero-intro__emit hero-intro__emit--far" data-text={titleText}>
            {titleLines.map((line, index) => (
              <span key={`far-${line}-${index}`} className="hero-assemble__line is-settled" data-text={line}>
                <span className="hero-assemble__text" data-text={line}>
                  {line}
                </span>
              </span>
            ))}
          </h1>
        </div>
      </div>
      <div className="hero-intro__layer hero-intro__glow" />
      <div className="hero-intro__layer hero-intro__glitch" />
      <div className="hero-intro__layer hero-intro__scanlines" />
      <div className="hero-intro__layer hero-intro__title-scan" />
      <div className="hero-intro__layer hero-intro__return-burst" />
      {/* Low-cost film grain + line-noise: tiled micro-patterns (no
          per-pixel noise shaders), gated on --intro-return-glitch. See
          globals.css `.hero-intro__noise`. */}
      <div className="hero-intro__layer hero-intro__noise" />
      {/* Irregular dark scan bands. Three coprime-period, phase-shifted
          multiply-blend stripes give the ~70/30 white/black look during
          plateau, then their bands widen with --intro-close-depth until
          the stacked black fills the viewport — THIS is the close-in. */}
      <div className="hero-intro__layer hero-intro__scanlines-dark" />
      {/* Corner-eating "glitch vignette" — only engages during stage 4's
          returnGlitch plateau. See the matching CSS for the rationale on
          why it's asymmetric and jittered instead of a clean circle. */}
      <div className="hero-intro__layer hero-intro__return-vignette" />
      {/* Invert strobe — solid white painted with mix-blend-mode: difference,
          opacity briefly snaps to ~1 a couple of times per cycle. Every
          frame it's "on" the whole composite below is colour-inverted
          (white text → black, black strikes → white, etc.), giving the
          black/white swap-cycle look. Gated on --intro-return-glitch so
          it's only alive during stage 4. Sits below the white flash so
          the snap-out flash isn't accidentally inverted. */}
      <div className="hero-intro__layer hero-intro__invert" />
      <div className="hero-intro__layer hero-intro__flash" />
    </div>
  );
}
