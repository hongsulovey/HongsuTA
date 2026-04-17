import { homeContent } from "@/features/home/data/homeContent";

export function AboutSection() {
  return (
    <section className="section">
      <div className="container">
        <h2>About</h2>
        <p>{homeContent.intro}</p>
        <p className="muted" style={{ marginTop: 12 }}>
          Unity/URP 기반 렌더링과 셰이더 구현을 중심으로, 시각 품질과 실제 제작 환경의 성능 제약을
          함께 다루는 작업을 정리하고 있습니다.
        </p>
      </div>
    </section>
  );
}
