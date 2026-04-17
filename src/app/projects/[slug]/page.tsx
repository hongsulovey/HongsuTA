import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectMedia } from "@/features/projects/components/ProjectMedia";
import {
  getAllProjectSlugs,
  getProjectBySlug,
} from "@/features/projects/utils/getProjectBySlug";

type ProjectDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

/**
 * Build-time static generation.
 * Every project in `projects.ts` produces a pre-rendered HTML page, so the
 * detail pages are served as static files at request time (no per-request
 * server render). `dynamicParams = false` makes any unknown slug return 404
 * instead of falling back to on-demand rendering.
 */
export function generateStaticParams() {
  return getAllProjectSlugs().map((slug) => ({ slug }));
}

export const dynamicParams = false;

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const hasHighlights = project.highlights && project.highlights.length > 0;
  const hasProcess = project.process && project.process.length > 0;
  const hasBeforeAfter = project.beforeAfter && project.beforeAfter.length > 0;
  const hasGallery = project.gallery && project.gallery.length > 0;
  const hasKeyContributions = project.keyContributions.length > 0;
  const hasResults = project.results.length > 0;
  const hasTags = project.tags.length > 0;

  return (
    <main className="container section project-detail">
      <p className="muted" style={{ marginBottom: 6 }}>
        <Link href="/projects" className="hero-glitch-hover" data-text="← Projects">
          <span className="hero-glitch-hover__label">← Projects</span>
        </Link>
      </p>
      <h1 style={{ marginBottom: 6 }}>{project.title}</h1>
      <p className="muted" style={{ marginTop: 0 }}>{project.role}</p>

      {project.hero ? (
        <ProjectMedia media={project.hero} className="project-detail__hero" eager />
      ) : null}

      {project.summary ? (
        <p className="project-detail__summary">{project.summary}</p>
      ) : null}

      {hasHighlights ? (
        <ul className="project-metrics project-metrics--large" aria-label="Key metrics">
          {project.highlights!.map((metric) => (
            <li key={metric.label} className="project-metric">
              <span className="project-metric__value">{metric.value}</span>
              <span className="project-metric__label">{metric.label}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {project.description ? (
        <section className="project-detail__section">
          <h2>Overview</h2>
          <p>{project.description}</p>
        </section>
      ) : null}

      {hasProcess ? (
        <section className="project-detail__section">
          <h2>Process</h2>
          <ol className="project-process">
            {project.process!.map((step, index) => (
              <li key={step.title} className="project-process__step">
                <div className="project-process__head">
                  <span className="project-process__index">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="project-process__title">{step.title}</h3>
                </div>
                <p className="project-process__body">{step.body}</p>
                {step.media ? (
                  <ProjectMedia media={step.media} className="project-process__media" />
                ) : null}
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {hasBeforeAfter ? (
        <section className="project-detail__section">
          <h2>Before / After</h2>
          <div className="project-compare">
            {project.beforeAfter!.map((pair, index) => (
              <article key={pair.label ?? index} className="project-compare__pair">
                {pair.label ? (
                  <header className="project-compare__head">
                    <h3 className="project-compare__label">{pair.label}</h3>
                    {pair.note ? <p className="muted project-compare__note">{pair.note}</p> : null}
                  </header>
                ) : null}
                <div className="project-compare__grid">
                  <div className="project-compare__side">
                    <span className="project-compare__tag project-compare__tag--before">BEFORE</span>
                    <ProjectMedia media={pair.before} showCaption={false} />
                  </div>
                  <div className="project-compare__side">
                    <span className="project-compare__tag project-compare__tag--after">AFTER</span>
                    <ProjectMedia media={pair.after} showCaption={false} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {hasKeyContributions ? (
        <section className="project-detail__section">
          <h2>Key Contributions</h2>
          <ul className="project-detail__list">
            {project.keyContributions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {hasResults ? (
        <section className="project-detail__section">
          <h2>Results</h2>
          <ul className="project-detail__list project-detail__list--results">
            {project.results.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {hasGallery ? (
        <section className="project-detail__section">
          <h2>Gallery</h2>
          <div className="project-gallery">
            {project.gallery!.map((item, index) => (
              <ProjectMedia key={item.src + index} media={item} />
            ))}
          </div>
        </section>
      ) : null}

      {hasTags ? (
        <section className="project-detail__section">
          <h2>Tags</h2>
          <div className="badge-list">
            {project.tags.map((tag) => (
              <span key={tag} className="badge">
                {tag}
              </span>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
