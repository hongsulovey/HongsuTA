"use client";

import { Canvas } from "@react-three/fiber";
import { HeroShapes } from "@/features/home/components/HeroShapes";
import { defaultEffects } from "@/shared/effects/presets";
import { effectRegistry } from "@/shared/effects/registry";

type HeroCanvasProps = {
  progress?: number;
  highlight?: number;
  pointer?: {
    x: number;
    y: number;
  };
  hovered?: boolean;
};

const baseHeroEffects = {
  ...defaultEffects,
  scanline: {
    ...defaultEffects.scanline,
    enabled: true,
    intensity: 0.42,
    speed: 0.85,
  },
};

function HeroScene({
  progress,
  highlight,
  pointer,
  hovered,
}: {
  progress: number;
  highlight: number;
  pointer: { x: number; y: number };
  hovered: boolean;
}) {
  const heroEffects = {
    ...baseHeroEffects,
    scanline: {
      ...baseHeroEffects.scanline,
      intensity: (baseHeroEffects.scanline.intensity ?? 0.42) + highlight * 0.18,
    },
  };

  return (
    <>
      {Object.entries(heroEffects).map(([key, config]) => {
        if (!config.enabled) {
          return null;
        }

        const Effect = effectRegistry[key as keyof typeof heroEffects];
        return (
          <Effect
            key={key}
            progress={progress}
            config={{ ...config, pointerX: pointer.x, pointerY: pointer.y, highlight }}
          />
        );
      })}
      <HeroShapes hovered={hovered} />
    </>
  );
}

export function HeroCanvas({
  progress = 0,
  highlight = 0,
  pointer = { x: 0.5, y: 0.42 },
  hovered = false,
}: HeroCanvasProps) {
  return (
    <div
      className="hero-canvas"
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(145deg, #0b101a, #0d1118)",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 55, near: 0.1, far: 50 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: false }}
        style={{ position: "absolute", inset: 0 }}
      >
        <HeroScene progress={progress} highlight={highlight} pointer={pointer} hovered={hovered} />
      </Canvas>
    </div>
  );
}
