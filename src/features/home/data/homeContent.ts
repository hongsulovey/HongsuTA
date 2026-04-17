export type HomeContent = {
  name: string;
  headlineLines: string[];
  role: string;
  tagline: string;
  intro: string;
  skills: string[];
  contact: {
    email: string;
    github: string;
  };
};

export const homeContent: HomeContent = {
  name: "Choi Hongsu",
  headlineLines: ["CHOI", "HONGSU"],
  role: "Technical Artist",
  tagline: "Real-time rendering, shader workflows, and performance optimization for production.",
  intro:
    "실시간 렌더링과 셰이더 작업을 중심으로, 프로젝트의 제약 안에서 품질과 성능을 함께 맞추는 Technical Artist 포지션을 지향합니다. 이 포트폴리오는 결과 이미지보다 문제 정의, 구현 방식, 그리고 실제 제작 파이프라인에서의 판단 과정을 명확하게 보여주는 데 초점을 둡니다.",
  skills: [
    "Unity",
    "URP",
    "Unreal",
    "GLSL",
    "HLSL",
    "Shader Graph",
    "Rendering Optimization",
    "Lookdev",
  ],
  contact: {
    email: "hongsulovey@gmail.com",
    github: "https://github.com/hongsulovey",
  },
};
