import type { EffectKey } from "@/shared/effects/types";

type EffectRenderer = () => null;

const noopEffect: EffectRenderer = () => null;

export const effectRegistry: Record<EffectKey, EffectRenderer> = {
  glitch: noopEffect,
  scanline: noopEffect,
  rgbShift: noopEffect,
  dissolve: noopEffect,
};
