"use client";

import { FloatingGeometry } from "@/features/home/components/FloatingGeometry";

// Background layer: 1–2 lightweight floating objects that continuously
// cycle through points → edges → UV-unwrapped plane → folded 3D mesh.
// Kept decoupled from HeroOverlay / layout; only mounted inside the
// existing R3F Canvas as a passive visual.
export function FloatingGeometrySystem() {
  return (
    <group>
      <FloatingGeometry
        position={[-2.6, 1.0, 0.4]}
        seed={0.0}
        speed={0.45}
        size={1.1}
        color="#7ad4ff"
        opacity={0.75}
        pointSize={11}
      />
      <FloatingGeometry
        position={[2.4, -0.7, 0.7]}
        seed={2.3}
        speed={0.35}
        size={0.95}
        color="#ff7acc"
        opacity={0.7}
        pointSize={10}
      />
    </group>
  );
}
