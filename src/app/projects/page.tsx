import Link from "next/link";
import { projects } from "@/features/projects/data/projects";

export default function ProjectsPage() {
  return (
    <main className="container section">
      <h1>Projects</h1>
      <p className="muted" style={{ maxWidth: 720 }}>
        렌더링, 셰이더, 룩디벨롭, 최적화 맥락이 보이는 작업을 중심으로 정리한 프로젝트 모음입니다.
      </p>
      <div className="card-grid" style={{ marginTop: 24 }}>
        {projects.map((project) => (
          <article key={project.slug} className="card">
            <h2 style={{ marginTop: 0, marginBottom: 8 }}>{project.title}</h2>
            <p className="muted" style={{ marginTop: 0 }}>{project.role}</p>
            <p>{project.summary}</p>
            <div className="badge-list" style={{ marginTop: 16, marginBottom: 16 }}>
              {project.tags.map((tag) => (
                <span key={tag} className="badge">
                  {tag}
                </span>
              ))}
            </div>
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
    </main>
  );
}
