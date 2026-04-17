import { projects, type Project } from "@/features/projects/data/projects";

// Build the slug → Project index once at module load.
// `projects` is a module-scoped static array, so this Map lives for the
// lifetime of the server process / client bundle and makes slug lookups O(1)
// instead of O(n) per request.
const projectBySlug: ReadonlyMap<string, Project> = new Map(
  projects.map((project) => [project.slug, project])
);

export function getProjectBySlug(slug: string): Project | undefined {
  return projectBySlug.get(slug);
}

export function getAllProjectSlugs(): string[] {
  return projects.map((project) => project.slug);
}
