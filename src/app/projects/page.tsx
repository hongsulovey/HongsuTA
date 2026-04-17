import { ProjectCard } from "@/features/projects/components/ProjectCard";
import { projects } from "@/features/projects/data/projects";

export default function ProjectsPage() {
  return (
    <main className="container section">
      <h1>Projects</h1>
      <p className="muted" style={{ maxWidth: 720 }}>
        Rendering · Shader · Optimization 문제 정의와 실측 결과를 중심으로 정리한 프로젝트 모음입니다.
      </p>
      <div className="card-grid" style={{ marginTop: 24 }}>
        {projects.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
    </main>
  );
}
