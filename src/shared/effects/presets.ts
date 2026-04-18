import type { EffectConfig, EffectKey } from "@/shared/effects/types";

export const defaultEffects: Record<EffectKey, EffectConfig> = {
  glitch: { enabled: false, intensity: 0.15, speed: 1.0 },
  scanline: { enabled: false, intensity: 0.1 },
  rgbShift: { enabled: false, intensity: 0.03 },
  dissolve: { enabled: false, intensity: 0.0, speed: 0.6 },
};

export const heroScanlineBaseConfig: EffectConfig = {
  ...defaultEffects.scanline,
  enabled: true,
  intensity: 0.42,
  speed: 0.85,
};
