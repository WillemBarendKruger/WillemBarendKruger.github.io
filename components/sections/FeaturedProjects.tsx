import { ProjectCard } from "@/components/ui/ProjectCard";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { featuredProjects, projects } from "@/data/projects";

export function FeaturedProjects() {
  const others = projects.filter((project) => !project.featured);

  return (
    <section className="mx-auto max-w-5xl px-4 py-24">
      <SectionHeading
        id="projects"
        index="03 // Artifacts"
        title="What I've built"
        blurb="Two with full write-ups. The rest are linked to source."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {featuredProjects.map((project, index) => (
          <Reveal key={project.slug} delayMs={index * 80}>
            <ProjectCard project={project} />
          </Reveal>
        ))}
      </div>
      <h3 className="mt-16 font-mono text-sm tracking-widest text-muted uppercase">
        Also built
      </h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {others.map((project, index) => (
          <Reveal key={project.slug} delayMs={index * 60}>
            <ProjectCard project={project} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
