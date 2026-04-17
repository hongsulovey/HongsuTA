export type Project = {
  slug: string;
  title: string;
  role: string;
  summary: string;
  tags: string[];
  thumbnail: string;
};

export const projects: Project[] = [
  {
    slug: "ovensmash-rendering",
    title: "OvenSmash Rendering",
    role: "Technical Artist",
    summary: "URP 기반 셰이더/렌더링/최적화 파이프라인 구축.",
    tags: ["Unity", "URP", "Shader", "Optimization"],
    thumbnail: "/images/projects/ovensmash.jpg",
  },
  {
    slug: "hologram-vfx-prototype",
    title: "Hologram VFX Prototype",
    role: "TA / Lookdev",
    summary: "Scanline + Fresnel + Glitch 조합의 홀로그램 표현 연구.",
    tags: ["GLSL", "PostFX", "Realtime VFX"],
    thumbnail: "/images/projects/hologram.jpg",
  },
];
