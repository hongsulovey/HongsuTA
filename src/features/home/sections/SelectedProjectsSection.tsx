import Link from "next/link";
import { projects } from "@/features/projects/data/projects";

export function SelectedProjectsSection() {
  return (
    <section className="section">
      <div className="container">
        <h2>Selected Projects</h2>
        <p className="muted">핵심 프로젝트 2~4개를 먼저 집중적으로 보여주세요.</p>
        <div className="card-grid" style={{ marginTop: 16 }}>
          {projects.map((project) => (
            <article key={project.slug} className="card">
              <h3 style={{ marginTop: 0 }}>{project.title}</h3>
              <p className="muted">{project.role}</p>
              <p>{project.summary}</p>
              <Link href={`/projects/${project.slug}`} className="btn">
                상세 보기
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
