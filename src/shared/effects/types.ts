import type { ComponentType } from "react";

/**
 * Registered effect keys. Every key must have a corresponding entry in
 * {@link ./registry.ts} and a default config in {@link ./presets.ts}.
 * Placeholder keys currently mapped to a noop renderer are intentional —
 * they reserve a slot for future shader passes without breaking callers.
 */
export type EffectKey = "glitch" | "scanline" | "rgbShift" | "dissolve";

/**
 * Runtime config passed from the hero section into each effect renderer.
 * All optional fields default to sensible values inside the renderer; the
 * shared shape keeps the registry iteration loop in `HeroCanvas` simple.
 */
export type EffectConfig = {
  enabled: boolean;
  intensity?: number;
  speed?: number;
  highlight?: number;
  pointerX?: number;
  pointerY?: number;
  pulse?: number;
  pulseX?: number;
  pulseY?: number;
};

export type EffectRendererProps = {
  progress: number;
  config: EffectConfig;
};

export type EffectRenderer = ComponentType<EffectRendererProps>;
