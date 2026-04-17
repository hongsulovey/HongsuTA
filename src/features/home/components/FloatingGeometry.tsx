"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  AdditiveBlending,
  BufferGeometry,
  Color,
  DoubleSide,
  Float32BufferAttribute,
  type ShaderMaterial,
} from "three";

// ──────────────────────────────────────────────────────────
// Geometry: unfolded cube "cross" with hinge metadata per vertex.
// Each face stores:
//   aHingeOrigin / aHingeAxis / aHingeAngle          – primary fold hinge
//   aHinge2Origin / aHinge2Axis / aHinge2Angle       – optional secondary hinge
//                                                     (used by the TOP face that
//                                                      folds off the BACK face)
// The vertex shader rotates each vertex around the hinge(s) by `angle * progress`
// so progress=0 → flat UV cross, progress=1 → fully assembled cube.
// ──────────────────────────────────────────────────────────

type Vec3 = [number, number, number];

function buildUnfoldCubeGeometry(unit = 1, subdiv = 2) {
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const hingeOrigin: number[] = [];
  const hingeAxis: number[] = [];
  const hingeAngle: number[] = [];
  const hinge2Origin: number[] = [];
  const hinge2Axis: number[] = [];
  const hinge2Angle: number[] = [];
  // Normalised distance (0..1) of each vertex from the centre of the flat
  // cross. Used by the vertex shader to drive a radial reveal wavefront so
  // edges appear "one ring at a time" from the middle outward.
  const radialDist: number[] = [];
  // Farthest point on the cross is the outer TOP corner at (±0.5, 2.5).
  const MAX_CROSS_DIST = Math.hypot(0.5, 2.5);

  let vertOffset = 0;

  const addFace = (
    minXY: [number, number],
    maxXY: [number, number],
    h1Origin: Vec3,
    h1Axis: Vec3,
    h1Angle: number,
    h2Origin: Vec3 = [0, 0, 0],
    h2Axis: Vec3 = [0, 0, 0],
    h2Angle: number = 0
  ) => {
    const n = subdiv + 1;
    for (let j = 0; j < n; j += 1) {
      for (let i = 0; i < n; i += 1) {
        const tx = i / subdiv;
        const ty = j / subdiv;
        const x = minXY[0] + (maxXY[0] - minXY[0]) * tx;
        const y = minXY[1] + (maxXY[1] - minXY[1]) * ty;
        positions.push(x * unit, y * unit, 0);
        uvs.push(tx, ty);
        hingeOrigin.push(h1Origin[0] * unit, h1Origin[1] * unit, h1Origin[2] * unit);
        hingeAxis.push(h1Axis[0], h1Axis[1], h1Axis[2]);
        hingeAngle.push(h1Angle);
        hinge2Origin.push(h2Origin[0] * unit, h2Origin[1] * unit, h2Origin[2] * unit);
        hinge2Axis.push(h2Axis[0], h2Axis[1], h2Axis[2]);
        hinge2Angle.push(h2Angle);
        radialDist.push(Math.hypot(x, y) / MAX_CROSS_DIST);
      }
    }
    for (let j = 0; j < subdiv; j += 1) {
      for (let i = 0; i < subdiv; i += 1) {
        const a = vertOffset + j * n + i;
        const b = a + 1;
        const c = a + n;
        const d = c + 1;
        indices.push(a, c, b, b, c, d);
      }
    }
    vertOffset += n * n;
  };

  const H = Math.PI / 2;

  // BOTTOM (anchor, stays flat)
  addFace([-0.5, -0.5], [0.5, 0.5], [0, 0, 0], [1, 0, 0], 0);

  // FRONT – folds up from the bottom edge
  addFace([-0.5, -1.5], [0.5, -0.5], [0, -0.5, 0], [1, 0, 0], -H);

  // BACK – folds up from the top edge
  addFace([-0.5, 0.5], [0.5, 1.5], [0, 0.5, 0], [1, 0, 0], H);

  // LEFT – folds up from the left edge
  addFace([-1.5, -0.5], [-0.5, 0.5], [-0.5, 0, 0], [0, 1, 0], H);

  // RIGHT – folds up from the right edge
  addFace([0.5, -0.5], [1.5, 0.5], [0.5, 0, 0], [0, 1, 0], -H);

  // TOP – two-step fold: follows BACK's rotation, then folds over BACK's far edge
  addFace(
    [-0.5, 1.5],
    [0.5, 2.5],
    [0, 0.5, 0], [1, 0, 0], H,
    [0, 1.5, 0], [1, 0, 0], H
  );

  const geom = new BufferGeometry();
  geom.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geom.setAttribute("uv", new Float32BufferAttribute(uvs, 2));
  geom.setAttribute("aHingeOrigin", new Float32BufferAttribute(hingeOrigin, 3));
  geom.setAttribute("aHingeAxis", new Float32BufferAttribute(hingeAxis, 3));
  geom.setAttribute("aHingeAngle", new Float32BufferAttribute(hingeAngle, 1));
  geom.setAttribute("aHinge2Origin", new Float32BufferAttribute(hinge2Origin, 3));
  geom.setAttribute("aHinge2Axis", new Float32BufferAttribute(hinge2Axis, 3));
  geom.setAttribute("aHinge2Angle", new Float32BufferAttribute(hinge2Angle, 1));
  geom.setAttribute("aRadialDist", new Float32BufferAttribute(radialDist, 1));
  geom.setIndex(indices);
  return geom;
}

// ──────────────────────────────────────────────────────────
// Shaders
// ──────────────────────────────────────────────────────────

const VERTEX_SHADER = /* glsl */ `
  attribute vec3 aHingeOrigin;
  attribute vec3 aHingeAxis;
  attribute float aHingeAngle;
  attribute vec3 aHinge2Origin;
  attribute vec3 aHinge2Axis;
  attribute float aHinge2Angle;
  attribute float aRadialDist;  // 0 at cross centre, 1 at farthest TOP corner

  uniform float u_time;
  uniform float u_seed;
  uniform float u_speed;
  uniform float u_pointSize;

  varying vec2 vUv;
  varying float vProgress;      // fold progress (0 flat, 1 folded cube)
  varying float vEdgeAmount;    // this vertex's wireframe visibility (0..1)
  varying float vFaceFold;

  // Rodrigues' rotation formula: rotate point p around axis (through origin).
  vec3 rotateAxis(vec3 p, vec3 origin, vec3 axis, float angle) {
    vec3 rel = p - origin;
    float c = cos(angle);
    float s = sin(angle);
    vec3 rotated = rel * c + cross(axis, rel) * s + axis * dot(axis, rel) * (1.0 - c);
    return origin + rotated;
  }

  // One full cycle is split into stages:
  //   0.00–0.20  points (flat) → edges appear        reveal↑  fade=1  fold=0
  //              ↳ radial wavefront from centre outward
  //   0.20–0.35  edges flat (hold)                   reveal=1 fade=1  fold=0
  //   0.35–0.50  edges fold into 3D cube             reveal=1 fade=1  fold↑
  //   0.50–0.65  folded hold, edges fade out         reveal=1 fade↓   fold=1
  //   0.65–0.85  points un-fold back to flat UV      reveal→0 fade=0  fold↓
  //   0.85–1.00  points (flat) hold before looping   reveal=0 fade=0  fold=0
  // Period matches the old sin cycle (2π / u_speed).
  const float TAU = 6.2831853;

  void main() {
    float t = u_time * u_speed + u_seed;
    float cycleT = fract(t / TAU);

    // 1) Radial reveal front: 0 at cycleT=0, grows to 1 by cycleT=0.2.
    //    Stays at 1 through the rest of the "edges exist" phases.
    float revealFront = smoothstep(0.0, 0.2, cycleT);
    // 2) Overall edge fade: holds 1 until 0.5, then fades to 0 by 0.65.
    float edgeFade = 1.0 - smoothstep(0.5, 0.65, cycleT);
    // 3) Fold: 0→1 on [0.35, 0.5], hold folded, 1→0 on [0.65, 0.85].
    float foldProgress = smoothstep(0.35, 0.5, cycleT) - smoothstep(0.65, 0.85, cycleT);

    // Per-vertex wavefront: a vertex becomes visible once the expanding
    // reveal front passes its aRadialDist. Small smoothing band gives a
    // soft "ring" edge instead of a hard step.
    float band = 0.12;
    float halfBand = band * 0.5;
    float reach = revealFront * (1.0 + band);
    float wavefront = 1.0 - smoothstep(reach - halfBand, reach + halfBand, aRadialDist);
    vEdgeAmount = wavefront * edgeFade;

    vec3 p = position;

    float angle1 = aHingeAngle * foldProgress;
    p = rotateAxis(p, aHingeOrigin, aHingeAxis, angle1);

    // secondary hinge (e.g. TOP face cascading off BACK): its origin/axis
    // must be transported by the first rotation before we apply the second.
    if (abs(aHinge2Angle) > 0.0001) {
      vec3 h2o = rotateAxis(aHinge2Origin, aHingeOrigin, aHingeAxis, angle1);
      vec3 h2a = rotateAxis(aHinge2Axis, vec3(0.0), aHingeAxis, angle1);
      float angle2 = aHinge2Angle * foldProgress;
      p = rotateAxis(p, h2o, h2a, angle2);
    }

    // subtle floating drift
    p.x += sin(t * 0.7) * 0.12;
    p.y += cos(t * 0.6) * 0.10;
    p.z += sin(t * 0.45) * 0.06;

    vUv = uv;
    vProgress = foldProgress;
    // amount this face actually folds (0 for the anchor, 1 for a moving face)
    vFaceFold = clamp(abs(aHingeAngle) / 1.5708, 0.0, 1.0);

    vec4 mvPos = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mvPos;
    gl_PointSize = u_pointSize * (1.0 / max(0.001, -mvPos.z));
  }
`;

const FRAGMENT_SHADER_MESH = /* glsl */ `
  uniform float u_time;
  uniform float u_seed;
  uniform vec3 u_color;
  uniform float u_opacity;

  varying vec2 vUv;
  varying float vProgress;
  varying float vEdgeAmount;
  varying float vFaceFold;

  void main() {
    float t = u_time + u_seed;
    float shimmer = 0.55 + 0.45 * sin(t * 1.6 + vUv.y * 14.0);

    // UV-frame emphasis (strongest when flat/unfolded)
    float frameX = smoothstep(0.46, 0.5, abs(vUv.x - 0.5));
    float frameY = smoothstep(0.46, 0.5, abs(vUv.y - 0.5));
    float frame = max(frameX, frameY);
    float unfoldGlow = frame * (1.0 - vProgress) * 0.65;

    vec3 col = u_color * (0.35 + 0.65 * shimmer);
    col += u_color * unfoldGlow;
    // hint of "hinge stress" colouring on moving faces mid-fold
    col += u_color * vFaceFold * (1.0 - abs(vProgress - 0.5) * 2.0) * 0.15;

    // vEdgeAmount rises radially from the centre outward, then fades together
    // during the 3D "hold" stage — so a fragment is lit only once the
    // wavefront has reached its vertex.
    gl_FragColor = vec4(col, u_opacity * vEdgeAmount);
  }
`;

const FRAGMENT_SHADER_POINTS = /* glsl */ `
  uniform vec3 u_color;
  uniform float u_opacity;

  varying float vProgress;
  varying float vEdgeAmount;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;
    float core = smoothstep(0.5, 0.0, d);

    // A vertex is visible whenever its edge is NOT visible. Since vEdgeAmount
    // rises radially (centre first), inner points dim out first while outer
    // points stay bright until the wavefront reaches them.
    float pointsOnly = 1.0 - vEdgeAmount;
    float alpha = core * pointsOnly * u_opacity;
    gl_FragColor = vec4(u_color, alpha);
  }
`;

// ──────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────

type FloatingGeometryProps = {
  position?: [number, number, number];
  seed?: number;
  speed?: number;
  size?: number;
  color?: string;
  opacity?: number;
  pointSize?: number;
};

export function FloatingGeometry({
  position = [0, 0, 0],
  seed = 0,
  speed = 0.5,
  size = 1.2,
  color = "#7ad4ff",
  opacity = 0.55,
  pointSize = 9,
}: FloatingGeometryProps) {
  const colorObj = useMemo(() => new Color(color), [color]);
  const meshMatRef = useRef<ShaderMaterial>(null);
  const pointsMatRef = useRef<ShaderMaterial>(null);

  const geometry = useMemo(() => buildUnfoldCubeGeometry(size, 2), [size]);
  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  const meshUniforms = useMemo(
    () => ({
      u_time: { value: 0 },
      u_seed: { value: seed },
      u_speed: { value: speed },
      u_pointSize: { value: 0 },
      u_color: { value: colorObj },
      u_opacity: { value: opacity },
    }),
    [seed, speed, colorObj, opacity]
  );

  const pointsUniforms = useMemo(
    () => ({
      u_time: { value: 0 },
      u_seed: { value: seed },
      u_speed: { value: speed },
      u_pointSize: { value: pointSize },
      u_color: { value: colorObj },
      u_opacity: { value: 1.0 },
    }),
    [seed, speed, colorObj, pointSize]
  );

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const m = meshMatRef.current;
    if (m) {
      m.uniforms.u_time.value = t;
      m.uniforms.u_seed.value = seed;
      m.uniforms.u_speed.value = speed;
      m.uniforms.u_opacity.value = opacity;
    }
    const pm = pointsMatRef.current;
    if (pm) {
      pm.uniforms.u_time.value = t;
      pm.uniforms.u_seed.value = seed;
      pm.uniforms.u_speed.value = speed;
      pm.uniforms.u_pointSize.value = pointSize;
    }
  });

  return (
    <group position={position}>
      {/*
        frustumCulled={false}: the vertex shader drifts + folds vertices well
        past the static geometry's bounding sphere. Three.js culls from that
        static sphere, so on narrow viewports (mobile) it wrongly decides the
        object is off-screen and the whole shape pops out. Disabling culling
        is the cheapest fix and the per-frame cost of 2 small draws is
        negligible.
      */}
      <mesh frustumCulled={false}>
        <primitive object={geometry} attach="geometry" />
        <shaderMaterial
          ref={meshMatRef}
          vertexShader={VERTEX_SHADER}
          fragmentShader={FRAGMENT_SHADER_MESH}
          uniforms={meshUniforms}
          transparent
          depthWrite={false}
          wireframe
          blending={AdditiveBlending}
          side={DoubleSide}
        />
      </mesh>
      <points frustumCulled={false}>
        <primitive object={geometry} attach="geometry" />
        <shaderMaterial
          ref={pointsMatRef}
          vertexShader={VERTEX_SHADER}
          fragmentShader={FRAGMENT_SHADER_POINTS}
          uniforms={pointsUniforms}
          transparent
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </points>
    </group>
  );
}
