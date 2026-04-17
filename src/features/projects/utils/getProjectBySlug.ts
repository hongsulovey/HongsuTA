import { projects, type Project } from "@/features/projects/data/projects";

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}
