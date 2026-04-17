import { ScanlinePlane } from "@/shared/effects/renderers/ScanlinePlane";
import type { EffectKey, EffectRenderer } from "@/shared/effects/types";

const noopEffect: EffectRenderer = () => null;

export const effectRegistry: Record<EffectKey, EffectRenderer> = {
  glitch: noopEffect,
  scanline: ScanlinePlane,
  rgbShift: noopEffect,
  dissolve: noopEffect,
};
