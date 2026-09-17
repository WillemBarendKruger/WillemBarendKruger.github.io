import { describe, expect, it } from "vitest";
import { validateProjects } from "@/data/validate";
import type { Project } from "@/data/types";

function project(overrides: Partial<Project> = {}): Project {
  return {
    slug: "example-project",
    name: "Example Project",
    tagline: "An example.",
    featured: false,
    status: "archived",
    collaboration: "solo",
    technologies: ["TypeScript"],
    links: { source: "https://github.com/example/example" },
    ...overrides,
  };
}

describe("validateProjects", () => {
  it("accepts a well-formed set", () => {
    expect(() => validateProjects([project()])).not.toThrow();
  });

  it("rejects duplicate slugs, which would collide as routes", () => {
    expect(() => validateProjects([project(), project()])).toThrow(/duplicate slug/i);
  });

  it("rejects a slug that is not URL-safe kebab-case", () => {
    expect(() => validateProjects([project({ slug: "Not A Slug" })])).toThrow(/slug/i);
  });

  it("rejects a malformed link", () => {
    expect(() =>
      validateProjects([project({ links: { source: "github.com/no-scheme" } })]),
    ).toThrow(/url/i);
  });

  it("rejects a project with no technologies listed", () => {
    expect(() => validateProjects([project({ technologies: [] })])).toThrow(/technolog/i);
  });

  it("rejects a featured project with no case study", () => {
    expect(() => validateProjects([project({ featured: true })])).toThrow(/case study/i);
  });

  it("rejects a featured project whose case study is incomplete", () => {
    expect(() =>
      validateProjects([
        project({
          featured: true,
          caseStudy: {
            problem: "",
            architecture: [{ layer: "Backend", detail: ".NET" }],
            features: ["Something"],
            planned: [],
            learned: "Something.",
          },
        }),
      ]),
    ).toThrow(/problem/i);
  });

  it("accepts a complete featured project", () => {
    expect(() =>
      validateProjects([
        project({
          featured: true,
          caseStudy: {
            problem: "A real problem statement.",
            architecture: [{ layer: "Backend", detail: ".NET 8" }],
            features: ["Equipment tracking"],
            planned: ["Automated tests in CI"],
            learned: "A real lesson.",
          },
        }),
      ]),
    ).not.toThrow();
  });
});
