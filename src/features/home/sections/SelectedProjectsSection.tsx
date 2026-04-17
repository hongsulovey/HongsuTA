import Link from "next/link";
import { projects } from "@/features/projects/data/projects";

export function SelectedProjectsSection() {
  return (
    <section className="section">
      <div className="container">
        <h2>Selected Projects</h2>
        <p className="muted">
          렌더링, 셰이더, 최적화 맥락이 드러나는 작업을 우선 배치해 기술적 기여가 보이도록 구성했습니다.
        </p>
        <div className="card-grid" style={{ marginTop: 16 }}>
          {projects.map((project) => (
            <article key={project.slug} className="card">
              <h3 style={{ marginTop: 0 }}>{project.title}</h3>
              <p className="muted">{project.role}</p>
              <p>{project.summary}</p>
              <Link
                href={`/projects/${project.slug}`}
                className="btn hero-glitch-hover"
                data-text="상세 보기"
              >
                <span className="hero-glitch-hover__label">상세 보기</span>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
