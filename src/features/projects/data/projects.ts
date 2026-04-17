export type ProjectMetric = {
  value: string;
  label: string;
};

/**
 * A single media asset (image, gif, or video).
 * Paths starting with "/" are served from `/public/...`.
 */
export type ProjectMedia = {
  type: "image" | "gif" | "video";
  src: string;
  alt?: string;
  caption?: string;
  /** Optional poster frame for video thumbnails before autoplay kicks in. */
  poster?: string;
  /** width/height aspect hint. If omitted, CSS provides a default 16:9 frame. */
  aspect?: string;
};

export type ProjectProcessStep = {
  title: string;
  body: string;
  media?: ProjectMedia;
};

export type ProjectBeforeAfter = {
  label?: string;
  note?: string;
  before: ProjectMedia;
  after: ProjectMedia;
};

export type Project = {
  slug: string;
  title: string;
  role: string;
  summary: string;
  description?: string;
  keyContributions: string[];
  results: string[];
  highlights?: ProjectMetric[];
  tags: string[];
  thumbnail?: string;
  /** Hero media shown at the top of the detail page. */
  hero?: ProjectMedia;
  /** Ordered walk-through of how the problem was solved. */
  process?: ProjectProcessStep[];
  /** Before/After comparisons to make results immediately visible. */
  beforeAfter?: ProjectBeforeAfter[];
  /** Supporting media (screens, gifs, short clips). */
  gallery?: ProjectMedia[];
};

/**
 * 프로젝트 목록 (표시 순서 = 배열 순서).
 *
 * 파일 위치:
 *   src/features/projects/data/projects.ts      ← 텍스트·수치·태그·미디어 경로
 *   public/images/projects/<slug>/...           ← 실제 이미지 / gif / mp4
 *
 * 상세 페이지 URL: /projects/<slug>
 */
export const projects: Project[] = [
  // ──────────────────────────────────────────────────────────────
  // 1) StormStriker — 공란 (양식만)
  // ──────────────────────────────────────────────────────────────
  {
    slug: "stormstriker",
    title: "StormStriker",
    role: "Technical Artist",
    summary: "",
    description: "",
    keyContributions: [
      // "작업 항목 1",
      // "작업 항목 2",
    ],
    results: [
      // "성과 / 수치 1",
      // "성과 / 수치 2",
    ],
    highlights: [
      // { value: "00×", label: "지표 이름" },
    ],
    tags: [
      // "Unity", "URP", "Shader", ...
    ],
    // thumbnail: "/images/projects/stormstriker/hero.svg",
    // hero: {
    //   type: "image",
    //   src: "/images/projects/stormstriker/hero.svg",
    //   alt: "StormStriker hero",
    //   caption: "",
    // },
    // process: [
    //   {
    //     title: "1. ",
    //     body: "",
    //     // media: { type: "image", src: "/images/projects/stormstriker/step-1.jpg", alt: "", caption: "" },
    //   },
    // ],
    // beforeAfter: [
    //   {
    //     label: "",
    //     note: "",
    //     before: { type: "image", src: "/images/projects/stormstriker/before.jpg", alt: "", caption: "Before" },
    //     after:  { type: "image", src: "/images/projects/stormstriker/after.jpg",  alt: "", caption: "After"  },
    //   },
    // ],
    // gallery: [
    //   { type: "image", src: "/images/projects/stormstriker/screen-1.jpg", alt: "" },
    //   { type: "video", src: "/images/projects/stormstriker/reel.mp4", poster: "/images/projects/stormstriker/reel-poster.jpg" },
    // ],
  },

  // ──────────────────────────────────────────────────────────────
  // 2) FlashGambit — 지금 사이트에 올라가 있는 실제 콘텐츠
  // ──────────────────────────────────────────────────────────────
  {
    slug: "flashgambit",
    title: "FlashGambit",
    role: "Technical Artist",
    summary:
      "Unity URP 기반 렌더링 파이프라인 설계 및 셰이더 · 최적화 작업. 모바일 환경에서 성능과 비주얼 품질을 동시에 개선.",
    description:
      "프로젝트 전반의 렌더링 구조를 정리하고, 실제 타깃 디바이스에서 측정 가능한 성능 개선을 만들어낸 작업입니다. 비주얼 톤을 훼손하지 않는 선에서 Draw Call, Overdraw, GPU 부하를 단계적으로 낮췄고, 프로덕션 워크플로에서 재사용 가능한 최적화 가이드라인으로 정리했습니다.",
    keyContributions: [
      "Custom rendering pipeline 설계 및 통합",
      "Shader 최적화 및 구조 정리",
      "GPU / CPU 병목 분석 및 개선",
      "VFX 및 UI 렌더링 성능 개선",
    ],
    results: [
      "Bloom 성능 최대 70× 개선",
      "VFX FPS 약 20% 향상",
      "Particle 수 64× 감소",
    ],
    highlights: [
      { value: "70×", label: "Bloom 성능" },
      { value: "+20%", label: "VFX FPS" },
      { value: "1/64", label: "Particle 수" },
    ],
    tags: ["Unity", "URP", "Shader", "Optimization", "Mobile"],
    thumbnail: "/images/projects/flashgambit/hero.svg",
    hero: {
      type: "image",
      src: "/images/projects/flashgambit/hero.svg",
      alt: "FlashGambit rendering hero",
      caption: "Unity URP · Mobile target rendering overview",
    },
    process: [
      {
        title: "1. 병목 측정",
        body:
          "RenderDoc / AGI 로 GPU 프레임을 캡처하고 단계별 비용을 분리해 확인했습니다. Bloom 패스와 파티클이 전체 프레임 시간의 과반을 차지했고, 저사양 디바이스일수록 Bloom의 하강폭이 더 큰 것을 확인했습니다.",
        media: {
          type: "image",
          src: "/images/projects/flashgambit/process-1-profile.svg",
          alt: "GPU profile capture showing bloom cost",
          caption: "GPU frame capture — Bloom 패스 비용이 가장 큼",
        },
      },
      {
        title: "2. Bloom 경로 재설계",
        body:
          "기존 다단계 blur 체인을 하향식 downsample + 정제된 threshold로 교체했습니다. 샘플 수를 줄이면서도 원본 톤을 유지하도록 tonemap 전/후 단계를 재배치했고, 모바일에서는 고정 프리셋으로 단순화했습니다.",
        media: {
          type: "image",
          src: "/images/projects/flashgambit/process-2-pipeline.svg",
          alt: "Bloom redesign diagram",
          caption: "Downsample + Threshold 재배치로 단순화된 Bloom 경로",
        },
      },
      {
        title: "3. VFX / Particle 다이어트",
        body:
          "비주얼 타겟을 유지하면서 파티클 수를 단계적으로 줄였습니다. 큰 폭의 개선은 트레일·서브이미터 통합과 셰이더 변형 제거에서 나왔고, UI 이펙트는 오버드로 기준으로 재구성했습니다.",
      },
      {
        title: "4. 가이드라인 문서화",
        body:
          "재현 가능한 개선이 되도록 체크리스트와 셰이더 작성 규칙을 정리했습니다. 새 셰이더·VFX가 들어올 때 같은 기준으로 검증되도록 PR 리뷰 템플릿에도 반영했습니다.",
      },
    ],
    beforeAfter: [
      {
        label: "Bloom 비용",
        note: "동일 씬 · 동일 타깃 디바이스 기준 1프레임 Bloom 패스 비용 비교",
        before: {
          type: "image",
          src: "/images/projects/flashgambit/bloom-before.svg",
          alt: "Bloom cost before optimization",
          caption: "Before · 기존 Bloom 경로",
        },
        after: {
          type: "image",
          src: "/images/projects/flashgambit/bloom-after.svg",
          alt: "Bloom cost after optimization",
          caption: "After · 재설계 후 Bloom 경로",
        },
      },
      {
        label: "Particle 수",
        note: "동일 스킬 이펙트 · 동일 타임 윈도우 기준 동시 파티클 수",
        before: {
          type: "image",
          src: "/images/projects/flashgambit/particles-before.svg",
          alt: "Particle count before optimization",
          caption: "Before · 원본 VFX",
        },
        after: {
          type: "image",
          src: "/images/projects/flashgambit/particles-after.svg",
          alt: "Particle count after optimization",
          caption: "After · 통합 후 VFX",
        },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────
  // 3) OvenSmash — 공란 (양식만)
  // ──────────────────────────────────────────────────────────────
  {
    slug: "ovensmash",
    title: "OvenSmash",
    role: "Technical Artist",
    summary: "",
    description: "",
    keyContributions: [
      // "작업 항목 1",
      // "작업 항목 2",
    ],
    results: [
      // "성과 / 수치 1",
      // "성과 / 수치 2",
    ],
    highlights: [
      // { value: "00×", label: "지표 이름" },
    ],
    tags: [
      // "Unity", "URP", "Shader", ...
    ],
    // thumbnail: "/images/projects/ovensmash/hero.svg",
    // hero: {
    //   type: "image",
    //   src: "/images/projects/ovensmash/hero.svg",
    //   alt: "OvenSmash hero",
    //   caption: "",
    // },
    // process: [
    //   {
    //     title: "1. ",
    //     body: "",
    //     // media: { type: "image", src: "/images/projects/ovensmash/step-1.jpg", alt: "", caption: "" },
    //   },
    // ],
    // beforeAfter: [
    //   {
    //     label: "",
    //     note: "",
    //     before: { type: "image", src: "/images/projects/ovensmash/before.jpg", alt: "", caption: "Before" },
    //     after:  { type: "image", src: "/images/projects/ovensmash/after.jpg",  alt: "", caption: "After"  },
    //   },
    // ],
    // gallery: [
    //   { type: "image", src: "/images/projects/ovensmash/screen-1.jpg", alt: "" },
    //   { type: "video", src: "/images/projects/ovensmash/reel.mp4", poster: "/images/projects/ovensmash/reel-poster.jpg" },
    // ],
  },
];
