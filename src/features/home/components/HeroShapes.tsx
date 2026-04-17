"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { AdditiveBlending } from "three";
import type { Group } from "three";

type ShapeKind = "sphere" | "box" | "tetra" | "octa" | "icosa";

type ShapeDef = {
  kind: ShapeKind;
  x: number;
  y: number;
  z: number;
  size: number;
  rotSpeed: [number, number, number];
  phase: number;
  driftX: number;
  driftY: number;
  color: string;
  tone: "cyan" | "magenta" | "white";
};

const SHAPES: ShapeDef[] = [
  { kind: "sphere", x: -2.8, y: 1.2, z: 0.5, size: 0.5, rotSpeed: [0.15, 0.22, 0], phase: 0.0, driftX: 0.25, driftY: 0.18, color: "#65e0ff", tone: "cyan" },
  { kind: "box", x: 2.6, y: 1.5, z: 0.8, size: 0.7, rotSpeed: [0.2, 0.12, 0.07], phase: 1.2, driftX: 0.2, driftY: 0.22, color: "#9ec0ff", tone: "white" },
  { kind: "tetra", x: 2.9, y: -1.1, z: 0.3, size: 0.6, rotSpeed: [0.17, 0.28, 0], phase: 2.4, driftX: 0.28, driftY: 0.2, color: "#ff6ec7", tone: "magenta" },
  { kind: "octa", x: -2.4, y: -1.4, z: 1.0, size: 0.55, rotSpeed: [0.13, 0.24, 0.04], phase: 3.2, driftX: 0.22, driftY: 0.24, color: "#65e0ff", tone: "cyan" },
  { kind: "box", x: 0.5, y: 1.8, z: 0.6, size: 0.45, rotSpeed: [0.28, 0.14, 0], phase: 4.1, driftX: 0.3, driftY: 0.2, color: "#65e0ff", tone: "cyan" },
  { kind: "tetra", x: -0.6, y: -1.6, z: 0.8, size: 0.52, rotSpeed: [0.16, 0.26, 0.06], phase: 5.0, driftX: 0.26, driftY: 0.22, color: "#9ec0ff", tone: "white" },
  { kind: "sphere", x: 3.5, y: 0.2, z: 1.2, size: 0.38, rotSpeed: [0.1, 0.22, 0], phase: 6.2, driftX: 0.18, driftY: 0.2, color: "#ff6ec7", tone: "magenta" },
  { kind: "icosa", x: -3.4, y: 0.0, z: 0.6, size: 0.48, rotSpeed: [0.2, 0.2, 0.05], phase: 7.0, driftX: 0.2, driftY: 0.22, color: "#9ec0ff", tone: "white" },
  { kind: "octa", x: 1.6, y: -0.4, z: 1.5, size: 0.34, rotSpeed: [0.24, 0.2, 0], phase: 8.1, driftX: 0.26, driftY: 0.22, color: "#65e0ff", tone: "cyan" },
  { kind: "box", x: -1.7, y: 0.3, z: 1.4, size: 0.32, rotSpeed: [0.22, 0.16, 0.04], phase: 9.3, driftX: 0.24, driftY: 0.2, color: "#ff6ec7", tone: "magenta" },
  { kind: "tetra", x: 2.1, y: 2.0, z: 0.2, size: 0.4, rotSpeed: [0.14, 0.3, 0.05], phase: 10.2, driftX: 0.22, driftY: 0.24, color: "#65e0ff", tone: "cyan" },
  { kind: "sphere", x: -2.0, y: 2.1, z: 1.0, size: 0.32, rotSpeed: [0.12, 0.18, 0], phase: 11.0, driftX: 0.2, driftY: 0.2, color: "#9ec0ff", tone: "white" },
  { kind: "icosa", x: 0.2, y: -2.0, z: 1.3, size: 0.4, rotSpeed: [0.18, 0.22, 0.06], phase: 12.4, driftX: 0.22, driftY: 0.2, color: "#65e0ff", tone: "cyan" },
  { kind: "octa", x: 3.2, y: -2.0, z: 0.8, size: 0.38, rotSpeed: [0.16, 0.24, 0], phase: 13.1, driftX: 0.22, driftY: 0.22, color: "#9ec0ff", tone: "white" },
];

function ShapeMesh({ kind, size }: { kind: ShapeKind; size: number }) {
  switch (kind) {
    case "sphere":
      return <sphereGeometry args={[size, 18, 14]} />;
    case "box":
      return <boxGeometry args={[size, size, size]} />;
    case "tetra":
      return <tetrahedronGeometry args={[size]} />;
    case "octa":
      return <octahedronGeometry args={[size]} />;
    case "icosa":
      return <icosahedronGeometry args={[size]} />;
  }
}

type FloatingShapeProps = {
  shape: ShapeDef;
  hovered: boolean;
};

function FloatingShape({ shape, hovered }: FloatingShapeProps) {
  const groupRef = useRef<Group>(null);

  useFrame(({ clock }, delta) => {
    const g = groupRef.current;
    if (!g) return;

    g.rotation.x += delta * shape.rotSpeed[0];
    g.rotation.y += delta * shape.rotSpeed[1];
    g.rotation.z += delta * shape.rotSpeed[2];

    const t = clock.elapsedTime + shape.phase;
    const floatX = Math.sin(t * 0.35) * shape.driftX;
    const floatY = Math.cos(t * 0.42) * shape.driftY;
    const floatZ = Math.sin(t * 0.28) * 0.2;

    const baseX = shape.x + floatX;
    const baseY = shape.y + floatY;
    const baseZ = shape.z + floatZ;

    const targetX = hovered ? 0 : baseX;
    const targetY = hovered ? 0 : baseY;
    const targetZ = hovered ? 0 : baseZ;
    const targetScale = hovered ? 0 : 1;

    const lerpAmt = hovered ? 0.22 : 0.06;
    g.position.x += (targetX - g.position.x) * lerpAmt;
    g.position.y += (targetY - g.position.y) * lerpAmt;
    g.position.z += (targetZ - g.position.z) * lerpAmt;

    const currentScale = g.scale.x;
    const nextScale = currentScale + (targetScale - currentScale) * lerpAmt;
    g.scale.setScalar(nextScale);
  });

  return (
    <group ref={groupRef} position={[shape.x, shape.y, shape.z]}>
      <mesh>
        <ShapeMesh kind={shape.kind} size={shape.size} />
        <meshBasicMaterial
          color={shape.color}
          wireframe
          transparent
          opacity={0.95}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh scale={1.08}>
        <ShapeMesh kind={shape.kind} size={shape.size} />
        <meshBasicMaterial
          color={shape.color}
          wireframe
          transparent
          opacity={0.25}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

export function HeroShapes({ hovered }: { hovered: boolean }) {
  const groupRef = useRef<Group>(null);

  useFrame((_, delta) => {
    const g = groupRef.current;
    if (!g) return;
    g.rotation.z += delta * (hovered ? 0.8 : 0.015);
    g.rotation.y += delta * (hovered ? 0.4 : 0.01);
  });

  return (
    <group ref={groupRef}>
      {SHAPES.map((shape, index) => (
        <FloatingShape key={index} shape={shape} hovered={hovered} />
      ))}
    </group>
  );
}
