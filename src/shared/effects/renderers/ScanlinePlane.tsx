"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { ShaderMaterial } from "three";
import type { EffectRendererProps } from "@/shared/effects/types";

const vertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  varying vec2 vUv;

  uniform float uTime;
  uniform float uProgress;
  uniform float uIntensity;
  uniform float uSpeed;
  uniform float uHighlight;
  uniform vec2 uPointer;
  uniform float uPulse;
  uniform vec2 uPulsePointer;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);

    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  // CRT barrel distortion
  vec2 crtCurve(vec2 uv) {
    vec2 cc = uv - 0.5;
    float dist = dot(cc, cc);
    float amount = 0.22 + uHighlight * 0.12;
    return uv + cc * dist * amount;
  }

  // Sample the procedural scene at a given UV
  vec3 sampleScene(vec2 uv) {
    float t = uTime * uSpeed;
    float sweep = smoothstep(-0.25, 1.1, uv.x + uProgress * 0.35);
    float grain = noise(uv * 8.0 + vec2(t * 0.2, -t * 0.1));
    float shimmer = noise(uv * 22.0 + vec2(t * 0.65, t * 0.35));
    float vignette = smoothstep(0.9, 0.05, distance(uv, vec2(0.5)));

    vec3 base = mix(vec3(0.03, 0.045, 0.08), vec3(0.07, 0.1, 0.18), uv.x + uv.y * 0.4);
    vec3 accent = vec3(0.43, 0.66, 1.0);
    vec3 color = base;

    color += accent * grain * uIntensity * 0.22;
    color += accent * shimmer * sweep * uIntensity * 0.1;
    color *= 0.5 + vignette * 0.85;

    return color;
  }

  void main() {
    vec2 uv = vUv;

    // 1) CRT barrel curvature
    vec2 curved = crtCurve(uv);

    // 2) Mild time-based swirl
    float t = uTime * uSpeed;
    float swirl = (noise(curved * 3.0 + t * 0.3) - 0.5) * 0.01;
    curved += vec2(swirl, swirl * 0.6);

    // 3) Horizontal glitch shift on hover
    float glitchShift = (noise(vec2(curved.y * 28.0, t * 1.4)) - 0.5) * 0.03 * uHighlight;
    curved.x += glitchShift;

    // 4) Radial burst distortion on click pulse
    vec2 pulseDelta = curved - uPulsePointer;
    float pulseDistance = length(pulseDelta * vec2(1.0, 1.18));
    float pulseMask = smoothstep(0.16, 0.0, pulseDistance) * uPulse;
    curved += normalize(pulseDelta + vec2(1e-5)) * pulseMask * 0.014;

    // 5) RGB split (chromatic aberration), stronger on hover and at screen edges
    vec2 cc = uv - 0.5;
    float edge = length(cc);
    float split = 0.0035 + edge * 0.006 + uHighlight * 0.012 + pulseMask * 0.008;

    vec3 color;
    color.r = sampleScene(curved + vec2( split, 0.0)).r;
    color.g = sampleScene(curved).g;
    color.b = sampleScene(curved - vec2( split, 0.0)).b;

    color += vec3(0.14, 0.18, 0.3) * pulseMask * 0.22;

    // 6) Beyond-curve mask (black border outside CRT)
    vec2 outside = max(vec2(0.0), abs(curved - 0.5) - 0.5);
    float offBounds = step(0.0001, length(outside));
    color *= 1.0 - offBounds;

    // 7) Edge vignette (stronger on corners from barrel)
    float edgeMask = smoothstep(0.36, 0.92, length(cc));
    color *= 1.0 - edgeMask * 0.72;

    gl_FragColor = vec4(color, 1.0);
  }
`;

export function ScanlinePlane({ progress, config }: EffectRendererProps) {
  const materialRef = useRef<ShaderMaterial>(null);
  const viewport = useThree((state) => state.viewport);

  // Mount-once uniforms. Values are mutated in-place inside useFrame so we
  // never re-bind the uniform map on the GPU, and never allocate new arrays
  // per frame / per pointer move.
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uProgress: { value: progress },
      uIntensity: { value: config.intensity ?? 0.16 },
      uSpeed: { value: config.speed ?? 0.7 },
      uHighlight: { value: config.highlight ?? 0 },
      uPointer: { value: [config.pointerX ?? 0.5, config.pointerY ?? 0.42] },
      uPulse: { value: config.pulse ?? 0 },
      uPulsePointer: { value: [config.pulseX ?? 0.5, config.pulseY ?? 0.42] },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useFrame((_, delta) => {
    const material = materialRef.current;
    if (!material) {
      return;
    }

    const u = material.uniforms;
    u.uTime.value += delta;
    u.uProgress.value = progress;
    u.uIntensity.value = config.intensity ?? 0.16;
    u.uSpeed.value = config.speed ?? 0.7;
    u.uHighlight.value = config.highlight ?? 0;

    const pointer = u.uPointer.value as number[];
    pointer[0] = config.pointerX ?? 0.5;
    pointer[1] = config.pointerY ?? 0.42;

    u.uPulse.value = config.pulse ?? 0;

    const pulsePointer = u.uPulsePointer.value as number[];
    pulsePointer[0] = config.pulseX ?? 0.5;
    pulsePointer[1] = config.pulseY ?? 0.42;
  });

  return (
    <mesh scale={[viewport.width, viewport.height, 1]} renderOrder={-1000}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        fragmentShader={fragmentShader}
        vertexShader={vertexShader}
        uniforms={uniforms}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}
