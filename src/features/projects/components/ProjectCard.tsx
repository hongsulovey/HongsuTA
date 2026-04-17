import Link from "next/link";
import type { Project } from "@/features/projects/data/projects";

type ProjectCardProps = {
  project: Project;
  /** Heading level to render the title as. Defaults to h2 for listing pages. */
  headingLevel?: 2 | 3;
};

/**
 * Single project card used in listing pages.
 * Pure server component — receives a plain object, renders static markup.
 * Keeping this as RSC means no client-side JS is shipped for the card itself;
 * only the hero glitch hover effect (CSS) and the Next Link prefetch run on the client.
 */
export function ProjectCard({ project, headingLevel = 2 }: ProjectCardProps) {
  const Heading = headingLevel === 3 ? "h3" : "h2";
  const hasHighlights = project.highlights && project.highlights.length > 0;
  const hasTags = project.tags.length > 0;

  return (
    <article className="card project-card">
      <Heading style={{ marginTop: 0, marginBottom: 4 }}>{project.title}</Heading>
      <p className="muted" style={{ marginTop: 0 }}>{project.role}</p>
      {project.summary ? <p>{project.summary}</p> : null}

      {hasHighlights ? (
        <ul className="project-metrics" aria-label="Key metrics">
          {project.highlights!.map((metric) => (
            <li key={metric.label} className="project-metric">
              <span className="project-metric__value">{metric.value}</span>
              <span className="project-metric__label">{metric.label}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {hasTags ? (
        <div className="badge-list" style={{ marginTop: 14, marginBottom: 14 }}>
          {project.tags.map((tag) => (
            <span key={tag} className="badge">
              {tag}
            </span>
          ))}
        </div>
      ) : null}

      <Link
        href={`/projects/${project.slug}`}
        className="btn hero-glitch-hover"
        data-text="상세 보기"
      >
        <span className="hero-glitch-hover__label">상세 보기</span>
      </Link>
    </article>
  );
}
