"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  AdditiveBlending,
  BoxGeometry,
  BufferGeometry,
  CanvasTexture,
  EdgesGeometry,
  Float32BufferAttribute,
  IcosahedronGeometry,
  LinearFilter,
  OctahedronGeometry,
  SphereGeometry,
  TetrahedronGeometry,
} from "three";
import type {
  Group,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  Points,
  PointsMaterial,
  Sprite,
  SpriteMaterial,
} from "three";

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

const HLSL_TOKENS = [
  "float4",
  "float3",
  "SV_POSITION",
  "mul(M,v)",
  "tex2D",
  "saturate",
  "lerp(a,b,t)",
  "normalize",
  "dot(n,l)",
  "uv.xy",
  "POSITION",
  "NORMAL",
  "TEXCOORD0",
  "return o",
  "_MainTex",
  "pow(nl,k)",
  "reflect",
  "half4",
  "UNITY_MATRIX_MVP",
  "frac(t)",
  "step(a,b)",
  "mad(a,b,c)",
  "float2(u,v)",
  "fixed4",
  "float3 n",
  "o.pos",
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

function buildBaseGeometry(kind: ShapeKind, size: number) {
  switch (kind) {
    case "sphere":
      return new SphereGeometry(size, 18, 14);
    case "box":
      return new BoxGeometry(size, size, size);
    case "tetra":
      return new TetrahedronGeometry(size);
    case "octa":
      return new OctahedronGeometry(size);
    case "icosa":
      return new IcosahedronGeometry(size);
  }
}

// Split EdgesGeometry into two disjoint halves so that each RGB ghost
// can carry its own unique subset of wireframe lines when separated.
function splitEdges(kind: ShapeKind, size: number) {
  const base = buildBaseGeometry(kind, size);
  const edges = new EdgesGeometry(base, 1);
  const positions = edges.attributes.position.array as Float32Array;
  const segmentCount = Math.floor(positions.length / 6);

  const halfAArr: number[] = [];
  const halfBArr: number[] = [];

  for (let i = 0; i < segmentCount; i += 1) {
    const offset = i * 6;
    const target = i % 2 === 0 ? halfAArr : halfBArr;
    for (let j = 0; j < 6; j += 1) {
      target.push(positions[offset + j]);
    }
  }

  base.dispose();
  edges.dispose();

  const makeGeom = (arr: number[]) => {
    const g = new BufferGeometry();
    g.setAttribute("position", new Float32BufferAttribute(arr, 3));
    return g;
  };

  return {
    halfA: makeGeom(halfAArr),
    halfB: makeGeom(halfBArr),
  };
}

function shapeVertices(kind: ShapeKind, size: number): Array<[number, number, number]> {
  const s = size;
  switch (kind) {
    case "box": {
      const h = s * 0.5;
      return [
        [h, h, h],
        [-h, h, h],
        [h, -h, h],
        [-h, -h, h],
        [h, h, -h],
        [-h, h, -h],
        [h, -h, -h],
        [-h, -h, -h],
      ];
    }
    case "tetra": {
      const base: Array<[number, number, number]> = [
        [1, 1, 1],
        [-1, -1, 1],
        [-1, 1, -1],
        [1, -1, -1],
      ];
      const scale = s / Math.sqrt(3);
      return base.map(([a, b, c]) => [a * scale, b * scale, c * scale]);
    }
    case "octa":
      return [
        [s, 0, 0],
        [-s, 0, 0],
        [0, s, 0],
        [0, -s, 0],
        [0, 0, s],
        [0, 0, -s],
      ];
    case "icosa": {
      const phi = (1 + Math.sqrt(5)) * 0.5;
      const raw: Array<[number, number, number]> = [
        [0, 1, phi], [0, 1, -phi], [0, -1, phi], [0, -1, -phi],
        [1, phi, 0], [1, -phi, 0], [-1, phi, 0], [-1, -phi, 0],
        [phi, 0, 1], [phi, 0, -1], [-phi, 0, 1], [-phi, 0, -1],
      ];
      const len = Math.sqrt(1 + phi * phi);
      const scale = s / len;
      return raw.map(([a, b, c]) => [a * scale, b * scale, c * scale]);
    }
    case "sphere": {
      const points: Array<[number, number, number]> = [];
      const count = 10;
      const golden = Math.PI * (3 - Math.sqrt(5));
      for (let i = 0; i < count; i += 1) {
        const y = 1 - (i / (count - 1)) * 2;
        const radius = Math.sqrt(1 - y * y);
        const theta = golden * i;
        const x = Math.cos(theta) * radius;
        const z = Math.sin(theta) * radius;
        points.push([x * s, y * s, z * s]);
      }
      return points;
    }
  }
}

// (token, tone) pairs are deterministic, so rendered pixels are identical
// across every FloatingShape. Cache textures process-wide and share them.
const tokenTextureCache = new Map<string, CanvasTexture>();

function getTokenTexture(token: string, tone: "cyan" | "magenta" | "white") {
  const key = `${tone}|${token}`;
  const cached = tokenTextureCache.get(key);
  if (cached) {
    return cached;
  }

  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    const tex = new CanvasTexture(canvas);
    tokenTextureCache.set(key, tex);
    return tex;
  }

  const color =
    tone === "cyan"
      ? "rgba(140, 238, 255, 1)"
      : tone === "magenta"
      ? "rgba(255, 150, 220, 1)"
      : "rgba(220, 232, 255, 1)";
  const glow =
    tone === "cyan"
      ? "rgba(90, 240, 255, 0.85)"
      : tone === "magenta"
      ? "rgba(255, 90, 200, 0.75)"
      : "rgba(158, 192, 255, 0.7)";

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = "600 34px ui-monospace, 'JetBrains Mono', Consolas, monospace";
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.shadowColor = glow;
  ctx.shadowBlur = 14;
  ctx.fillStyle = color;
  ctx.fillText(token, canvas.width / 2, canvas.height / 2);

  const tex = new CanvasTexture(canvas);
  tex.minFilter = LinearFilter;
  tex.magFilter = LinearFilter;
  tex.needsUpdate = true;
  tokenTextureCache.set(key, tex);
  return tex;
}

type FloatingShapeProps = {
  shape: ShapeDef;
  hovered: boolean;
  pulse: number;
};

function FloatingShape({ shape, hovered, pulse }: FloatingShapeProps) {
  const groupRef = useRef<Group>(null);
  const mainRef = useRef<Mesh>(null);
  const pointsRef = useRef<Points>(null);
  // cyanGhost = halfA (primary, always on) + halfB (shared, fades out when split)
  // magentaGhost = halfB (primary, always on) + halfA (shared, fades out when split)
  const cyanGroupRef = useRef<Group>(null);
  const magentaGroupRef = useRef<Group>(null);
  const cyanSharedRef = useRef<LineSegments>(null);
  const magentaSharedRef = useRef<LineSegments>(null);
  const spritesGroupRef = useRef<Group>(null);
  const pulseRef = useRef(0);

  const vertices = useMemo(() => shapeVertices(shape.kind, shape.size), [shape.kind, shape.size]);

  const edgeHalves = useMemo(() => splitEdges(shape.kind, shape.size), [shape.kind, shape.size]);

  useEffect(() => {
    return () => {
      edgeHalves.halfA.dispose();
      edgeHalves.halfB.dispose();
    };
  }, [edgeHalves]);

  const tokenPalette = useMemo(() => {
    const baseOffset = Math.floor(Math.abs(shape.phase * 7)) % HLSL_TOKENS.length;
    return vertices.map((_, index) => {
      const tone: "cyan" | "magenta" | "white" =
        index % 3 === 0 ? "cyan" : index % 3 === 1 ? "magenta" : "white";
      return {
        token: HLSL_TOKENS[(baseOffset + index * 3) % HLSL_TOKENS.length],
        tone,
      };
    });
  }, [vertices, shape.phase]);

  // Shared, process-wide cache — do NOT dispose per-shape unmount.
  const textures = useMemo(
    () => tokenPalette.map(({ token, tone }) => getTokenTexture(token, tone)),
    [tokenPalette]
  );

  useFrame(({ clock }, delta) => {
    const g = groupRef.current;
    if (!g) return;

    // Treat UI hover the same as a background-click pulse so the shapes
    // split into RGB ghosts + vertex points instead of collapsing to a point.
    const targetPulse = Math.max(pulse, hovered ? 1 : 0);
    pulseRef.current += (targetPulse - pulseRef.current) * 0.22;
    const p = pulseRef.current;

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

    g.position.x += (baseX - g.position.x) * 0.06;
    g.position.y += (baseY - g.position.y) * 0.06;
    g.position.z += (baseZ - g.position.z) * 0.06;

    const currentScale = g.scale.x;
    const nextScale = currentScale + (1 - currentScale) * 0.1;
    g.scale.setScalar(nextScale);

    const baseOffset = 0.022;
    const burstOffset = p * 0.13;
    const shiftX = baseOffset + burstOffset;
    const shiftY = (baseOffset + burstOffset) * 0.32;

    const main = mainRef.current;
    if (main) {
      const material = main.material as MeshBasicMaterial;
      material.opacity = 0.95 * (1 - p);
      main.visible = material.opacity > 0.02;
    }

    const points = pointsRef.current;
    if (points) {
      const material = points.material as PointsMaterial;
      material.opacity = p;
      points.visible = p > 0.02;
    }

    const cyanGroup = cyanGroupRef.current;
    if (cyanGroup) {
      cyanGroup.position.set(shiftX, shiftY, 0);
      cyanGroup.children.forEach((child) => {
        const mat = (child as LineSegments).material as LineBasicMaterial;
        if (child === cyanSharedRef.current) {
          // shared half fades out when ghost splits apart
          mat.opacity = 0.55 * (1 - p);
        } else {
          // primary half stays on and intensifies on split
          mat.opacity = 0.55 + p * 0.4;
        }
      });
    }

    const magentaGroup = magentaGroupRef.current;
    if (magentaGroup) {
      magentaGroup.position.set(-shiftX, -shiftY, 0);
      magentaGroup.children.forEach((child) => {
        const mat = (child as LineSegments).material as LineBasicMaterial;
        if (child === magentaSharedRef.current) {
          mat.opacity = 0.5 * (1 - p);
        } else {
          mat.opacity = 0.5 + p * 0.4;
        }
      });
    }

    const sprites = spritesGroupRef.current;
    if (sprites) {
      const outwardScale = 0.35 * p;
      const jitterAmount = 0.06 * p;
      sprites.children.forEach((child, index) => {
        const sprite = child as Sprite;
        const vertex = vertices[index];
        const len = Math.max(1e-4, Math.hypot(vertex[0], vertex[1], vertex[2]));
        const nx = vertex[0] / len;
        const ny = vertex[1] / len;
        const nz = vertex[2] / len;
        const jitter = jitterAmount * (Math.random() - 0.5);

        sprite.position.set(
          vertex[0] + nx * outwardScale + jitter,
          vertex[1] + ny * outwardScale + jitter,
          vertex[2] + nz * outwardScale
        );

        const material = sprite.material as SpriteMaterial;
        material.opacity = Math.min(1, 0.0 + p * 1.0 + (p > 0.02 ? 0.08 : 0));
      });
    }
  });

  const spriteScale: [number, number, number] = [shape.size * 1.6, shape.size * 0.4, 1];

  return (
    <group ref={groupRef} position={[shape.x, shape.y, shape.z]}>
      <mesh ref={mainRef}>
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
      <points ref={pointsRef} visible={false}>
        <ShapeMesh kind={shape.kind} size={shape.size} />
        <pointsMaterial
          color={shape.color}
          size={shape.size * 0.14}
          sizeAttenuation
          transparent
          opacity={0}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </points>
      <group ref={cyanGroupRef}>
        <lineSegments>
          <primitive object={edgeHalves.halfA} attach="geometry" />
          <lineBasicMaterial
            color="#5af0ff"
            transparent
            opacity={0.55}
            blending={AdditiveBlending}
            depthWrite={false}
          />
        </lineSegments>
        <lineSegments ref={cyanSharedRef}>
          <primitive object={edgeHalves.halfB} attach="geometry" />
          <lineBasicMaterial
            color="#5af0ff"
            transparent
            opacity={0.55}
            blending={AdditiveBlending}
            depthWrite={false}
          />
        </lineSegments>
      </group>
      <group ref={magentaGroupRef}>
        <lineSegments>
          <primitive object={edgeHalves.halfB} attach="geometry" />
          <lineBasicMaterial
            color="#ff5ac8"
            transparent
            opacity={0.5}
            blending={AdditiveBlending}
            depthWrite={false}
          />
        </lineSegments>
        <lineSegments ref={magentaSharedRef}>
          <primitive object={edgeHalves.halfA} attach="geometry" />
          <lineBasicMaterial
            color="#ff5ac8"
            transparent
            opacity={0.5}
            blending={AdditiveBlending}
            depthWrite={false}
          />
        </lineSegments>
      </group>
      <group ref={spritesGroupRef}>
        {vertices.map((vertex, index) => (
          <sprite key={index} position={vertex} scale={spriteScale}>
            <spriteMaterial
              map={textures[index]}
              transparent
              depthWrite={false}
              opacity={0}
              blending={AdditiveBlending}
            />
          </sprite>
        ))}
      </group>
    </group>
  );
}

export function HeroShapes({ hovered, pulse = 0 }: { hovered: boolean; pulse?: number }) {
  const groupRef = useRef<Group>(null);
  const { viewport } = useThree();

  // Fit all floating shapes inside the camera frustum regardless of viewport aspect.
  // DESIGN_WIDTH / DESIGN_HEIGHT are padded to account for shape size, drift and
  // the extra foreshortening of shapes placed at larger z offsets.
  const fitScale = useMemo(() => {
    const DESIGN_WIDTH = 11;
    const DESIGN_HEIGHT = 6;
    const scaleX = viewport.width / DESIGN_WIDTH;
    const scaleY = viewport.height / DESIGN_HEIGHT;
    const s = Math.min(scaleX, scaleY);
    return Math.max(0.4, Math.min(1, s));
  }, [viewport.width, viewport.height]);

  useFrame((_, delta) => {
    const g = groupRef.current;
    if (!g) return;
    g.rotation.z += delta * 0.015;
    g.rotation.y += delta * 0.01;
  });

  return (
    <group ref={groupRef} scale={fitScale}>
      {SHAPES.map((shape, index) => (
        <FloatingShape key={index} shape={shape} hovered={hovered} pulse={pulse} />
      ))}
    </group>
  );
}
