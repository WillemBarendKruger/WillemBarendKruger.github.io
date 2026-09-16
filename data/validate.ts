import type { Project } from "./types";

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function assertUrl(value: string, context: string): void {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`${context}: not a valid absolute URL: ${value}`);
  }
  if (parsed.protocol !== "https:") {
    throw new Error(`${context}: URL must use https: ${value}`);
  }
}

function assertNonEmpty(value: string, context: string): void {
  if (value.trim().length === 0) throw new Error(`${context}: must not be empty`);
}

/**
 * Imported by the data modules themselves, so bad content fails `next build`
 * rather than shipping a broken card to production.
 */
export function validateProjects(projects: readonly Project[]): void {
  const seen = new Set<string>();

  for (const project of projects) {
    const where = `project "${project.slug}"`;

    if (!SLUG.test(project.slug)) {
      throw new Error(`${where}: slug must be lowercase kebab-case`);
    }
    if (seen.has(project.slug)) {
      throw new Error(`duplicate slug: ${project.slug}`);
    }
    seen.add(project.slug);

    assertNonEmpty(project.name, `${where}: name`);
    assertNonEmpty(project.tagline, `${where}: tagline`);

    if (project.technologies.length === 0) {
      throw new Error(`${where}: must list at least one technology`);
    }

    for (const [key, url] of Object.entries(project.links)) {
      if (url) assertUrl(url, `${where}: links.${key}`);
    }

    if (!project.featured) continue;

    const study = project.caseStudy;
    if (!study) {
      throw new Error(`${where}: featured projects require a case study`);
    }
    assertNonEmpty(study.problem, `${where}: caseStudy.problem`);
    assertNonEmpty(study.learned, `${where}: caseStudy.learned`);
    if (study.architecture.length === 0) {
      throw new Error(`${where}: caseStudy.architecture must not be empty`);
    }
    if (study.features.length === 0) {
      throw new Error(`${where}: caseStudy.features must not be empty`);
    }
  }
}
