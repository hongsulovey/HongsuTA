export type SkillGroup = {
  title: string;
  items: string[];
};

export type HomeContent = {
  name: string;
  headlineLines: string[];
  role: string;
  tagline: string;
  subTagline: string;
  aboutParagraphs: string[];
  identity: string[];
  skillGroups: SkillGroup[];
  contact: {
    email: string;
    github: string;
  };
};

export const homeContent: HomeContent = {
  name: "Choi Hongsu",
  headlineLines: ["CHOI", "HONGSU"],
  role: "Technical Artist",
  tagline:
    "Real-time rendering, shader development, and performance optimization for mobile production.",
  subTagline: "Unity URP · Shader · Optimization · Mobile Rendering",
  aboutParagraphs: [
    "I am a Technical Artist specializing in real-time rendering, shader development, and performance optimization.",
    "I focus on building production-ready rendering systems that balance visual quality and performance, especially in mobile environments.",
    "My work includes custom shader development, rendering pipeline design, shadow systems, and GPU optimization.",
    "I have hands-on experience improving real production performance with measurable results, including large-scale optimization of rendering, VFX, and UI systems.",
    "I aim to solve practical rendering problems and deliver stable, efficient solutions for real-time applications.",
  ],
  identity: [
    "나는 성능 개선을 실제로 해본 TA다.",
    "Shader · Rendering · Optimization을 함께 다룬다.",
    "모바일 기준에서도 돌아가게 만든다.",
  ],
  skillGroups: [
    {
      title: "Rendering",
      items: [
        "Unity URP (Forward)",
        "Real-time Rendering Pipeline",
        "Mobile Rendering Optimization",
        "Shadow Systems / Post Processing",
      ],
    },
    {
      title: "Shader",
      items: [
        "HLSL / GLSL",
        "Custom Shader Development",
        "VFX / UI Shader",
        "Shader Optimization",
      ],
    },
    {
      title: "Performance",
      items: [
        "GPU Profiling (RenderDoc, AGI)",
        "CPU / GPU Bottleneck Analysis",
        "Draw Call / Overdraw Optimization",
        "Memory Optimization",
      ],
    },
    {
      title: "Pipeline",
      items: [
        "Rendering Pipeline Design",
        "Shader / VFX Guideline 구축",
        "Resource Optimization Tools",
        "Production Workflow 개선",
      ],
    },
  ],
  contact: {
    email: "hongsulovey@gmail.com",
    github: "https://github.com/hongsulovey",
  },
};
