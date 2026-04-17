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
    summary:
      "Unity URP 환경에서 셰이더, 라이팅, 렌더링 흐름을 정리하고 모바일 타깃 기준 성능 최적화 방향을 함께 설계한 작업.",
    tags: ["Unity", "URP", "Shader", "Rendering", "Optimization"],
    thumbnail: "/images/projects/ovensmash.jpg",
  },
  {
    slug: "hologram-vfx-prototype",
    title: "Hologram VFX Prototype",
    role: "TA / Lookdev",
    summary:
      "Scanline, Fresnel, Glitch 계열 표현을 조합해 실시간 화면에서 읽히는 홀로그램 룩을 탐색하고 연출 강도를 조절한 프로토타입.",
    tags: ["GLSL", "Realtime VFX", "Lookdev", "PostFX"],
    thumbnail: "/images/projects/hologram.jpg",
  },
];
