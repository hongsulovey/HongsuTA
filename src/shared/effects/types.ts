export type EffectKey = "glitch" | "scanline" | "rgbShift" | "dissolve";

export type EffectConfig = {
  enabled: boolean;
  intensity?: number;
  speed?: number;
};
