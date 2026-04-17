"use client";

import { Canvas } from "@react-three/fiber";
import { FloatingGeometrySystem } from "@/features/home/components/FloatingGeometrySystem";
import { HeroShapes } from "@/features/home/components/HeroShapes";
import { defaultEffects } from "@/shared/effects/presets";
import { effectRegistry } from "@/shared/effects/registry";

/**
 * Hero R3F canvas.
 *
 * This is the single mount point for every 3D / shader visual in the hero
 * section. New shader passes should be added as:
 *   1. a renderer component in `@/shared/effects/renderers`
 *   2. a key in `@/shared/effects/types::EffectKey`
 *   3. an entry in `@/shared/effects/registry`
 *   4. a default config in `@/shared/effects/presets`
 * then enabled by merging overrides into `baseHeroEffects` below.
 *
 * Scene-graph children (e.g. `<HeroShapes />`, `<FloatingGeometrySystem />`)
 * are kept as plain R3F components next to this file and composed inside
 * `HeroScene`. Keeping this split makes it straightforward to attach
 * additional passes / post-processing later without touching callers.
 */

type HeroCanvasProps = {
  progress?: number;
  highlight?: number;
  pointer?: {
    x: number;
    y: number;
  };
  hovered?: boolean;
  pulse?: number;
  pulsePointer?: {
    x: number;
    y: number;
  };
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
  pulse,
  pulsePointer,
}: {
  progress: number;
  highlight: number;
  pointer: { x: number; y: number };
  hovered: boolean;
  pulse: number;
  pulsePointer: { x: number; y: number };
}) {
  const heroEffects = {
    ...baseHeroEffects,
    scanline: {
      ...baseHeroEffects.scanline,
      intensity: (baseHeroEffects.scanline.intensity ?? 0.42) + highlight * 0.18,
      pulse,
      pulseX: pulsePointer.x,
      pulseY: pulsePointer.y,
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
      <FloatingGeometrySystem />
      <HeroShapes hovered={hovered} pulse={pulse} />
    </>
  );
}

export function HeroCanvas({
  progress = 0,
  highlight = 0,
  pointer = { x: 0.5, y: 0.42 },
  hovered = false,
  pulse = 0,
  pulsePointer = { x: 0.5, y: 0.42 },
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
        camera={{ position: [0, 0, 5], fov: 55, near: 0.04, far: 50 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: false }}
        style={{ position: "absolute", inset: 0 }}
      >
        <HeroScene
          progress={progress}
          highlight={highlight}
          pointer={pointer}
          hovered={hovered}
          pulse={pulse}
          pulsePointer={pulsePointer}
        />
      </Canvas>
    </div>
  );
}
