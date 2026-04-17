import { projects } from "@/features/projects/data/projects";

export function getProjectBySlug(slug: string) {
  return projects.find((project) => project.slug === slug);
}
