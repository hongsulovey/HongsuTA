import type { ComponentType } from "react";

export type EffectKey = "glitch" | "scanline" | "rgbShift" | "dissolve";

export type EffectConfig = {
  enabled: boolean;
  intensity?: number;
  speed?: number;
  highlight?: number;
  pointerX?: number;
  pointerY?: number;
};

export type EffectRendererProps = {
  progress: number;
  config: EffectConfig;
};

export type EffectRenderer = ComponentType<EffectRendererProps>;
