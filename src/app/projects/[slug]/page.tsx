import { notFound } from "next/navigation";
import { getProjectBySlug } from "@/features/projects/utils/getProjectBySlug";

type ProjectDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  return (
    <main className="container section">
      <h1>{project.title}</h1>
      <p className="muted">{project.role}</p>
      <p>{project.summary}</p>
      <div className="badge-list">
        {project.tags.map((tag) => (
          <span key={tag} className="badge">
            {tag}
          </span>
        ))}
      </div>
    </main>
  );
}
