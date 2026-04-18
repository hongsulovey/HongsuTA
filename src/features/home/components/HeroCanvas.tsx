"use client";

import { Canvas } from "@react-three/fiber";
import { memo, useMemo } from "react";
import { FloatingGeometrySystem } from "@/features/home/components/FloatingGeometrySystem";
import { HeroShapes } from "@/features/home/components/HeroShapes";
import { heroScanlineBaseConfig } from "@/shared/effects/presets";
import { effectRegistry } from "@/shared/effects/registry";
import type { EffectConfig } from "@/shared/effects/types";

/**
 * Hero R3F canvas.
 *
 * This is the single mount point for every 3D / shader visual in the hero
 * section. New shader passes should be added as:
 *   1. a renderer component in `@/shared/effects/renderers`
 *   2. a key in `@/shared/effects/types::EffectKey`
 *   3. an entry in `@/shared/effects/registry`
 *   4. a default config in `@/shared/effects/presets`
 * then enabled by composing a hero-local config in `HeroScene`.
 *
 * Scene-graph children (e.g. `<HeroShapes />`, `<FloatingGeometrySystem />`)
 * are kept as plain R3F components next to this file and composed inside
 * `HeroScene`. Keeping this split makes it straightforward to attach
 * additional passes / post-processing later without touching callers.
 */

type HeroCanvasProps = {
  progress?: number;
  highlight?: number;
  hovered?: boolean;
  pulse?: number;
  pulsePointer?: {
    x: number;
    y: number;
  };
};

const HERO_CANVAS_WRAPPER_STYLE = {
  position: "absolute",
  inset: 0,
  background: "linear-gradient(145deg, #0b101a, #0d1118)",
} as const;

const HERO_CANVAS_LAYER_STYLE = {
  position: "absolute",
  inset: 0,
} as const;

const HERO_CANVAS_CAMERA = {
  position: [0, 0, 5] as [number, number, number],
  fov: 55,
  near: 0.04,
  far: 50,
};

const HERO_CANVAS_DPR: [number, number] = [1, 1.75];

const HERO_CANVAS_GL = {
  antialias: true,
  alpha: false,
} as const;

const DEFAULT_PULSE_POINTER = { x: 0.5, y: 0.42 };

const StaticGeometryLayer = memo(function StaticGeometryLayer({
  hovered,
  pulse,
}: {
  hovered: boolean;
  pulse: number;
}) {
  return (
    <>
      <FloatingGeometrySystem />
      <HeroShapes hovered={hovered} pulse={pulse} />
    </>
  );
});

function HeroScene({
  progress,
  highlight,
  hovered,
  pulse,
  pulsePointer,
}: {
  progress: number;
  highlight: number;
  hovered: boolean;
  pulse: number;
  pulsePointer: { x: number; y: number };
}) {
  const scanlineConfig = useMemo<EffectConfig>(
    () => ({
      ...heroScanlineBaseConfig,
      intensity: (heroScanlineBaseConfig.intensity ?? 0.42) + highlight * 0.18,
      highlight,
      pulse,
      pulseX: pulsePointer.x,
      pulseY: pulsePointer.y,
    }),
    [highlight, pulse, pulsePointer.x, pulsePointer.y]
  );

  const ScanlineEffect = effectRegistry.scanline;

  return (
    <>
      {scanlineConfig.enabled ? (
        <ScanlineEffect
          progress={progress}
          config={scanlineConfig}
        />
      ) : null}
      <StaticGeometryLayer hovered={hovered} pulse={pulse} />
    </>
  );
}

export function HeroCanvas({
  progress = 0,
  highlight = 0,
  hovered = false,
  pulse = 0,
  pulsePointer = DEFAULT_PULSE_POINTER,
}: HeroCanvasProps) {
  return (
    <div
      className="hero-canvas"
      aria-hidden
      style={HERO_CANVAS_WRAPPER_STYLE}
    >
      <Canvas
        camera={HERO_CANVAS_CAMERA}
        dpr={HERO_CANVAS_DPR}
        gl={HERO_CANVAS_GL}
        style={HERO_CANVAS_LAYER_STYLE}
      >
        <HeroScene
          progress={progress}
          highlight={highlight}
          hovered={hovered}
          pulse={pulse}
          pulsePointer={pulsePointer}
        />
      </Canvas>
    </div>
  );
}
