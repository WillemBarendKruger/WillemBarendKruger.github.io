import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { GlowButton } from "@/components/ui/GlowButton";
import { Panel } from "@/components/ui/Panel";
import { Tag } from "@/components/ui/Tag";
import { featuredProjects, getProject } from "@/data/projects";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return featuredProjects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return { title: project.name, description: project.tagline };
}

export default async function ProjectPage({ params }: Params) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project?.caseStudy) notFound();

  const study = project.caseStudy;

  return (
    <article className="mx-auto max-w-3xl px-4 py-20">
      <GlowButton href="/" variant="ghost">
        &larr; Back
      </GlowButton>

      <header className="mt-10">
        <p className="font-mono text-xs tracking-[0.3em] text-purple uppercase">
          Artifact
        </p>
        <h1 className="mt-2 font-mono text-3xl text-text sm:text-4xl">
          {project.name}
        </h1>
        <p className="mt-4 text-lg text-muted">{project.tagline}</p>
        {project.attribution ? (
          <p className="mt-4 border-l-2 border-purple/50 pl-4 text-sm text-muted">
            {project.attribution}
          </p>
        ) : null}
        <ul className="mt-6 flex flex-wrap gap-2">
          {project.technologies.map((tech) => (
            <li key={tech}>
              <Tag>{tech}</Tag>
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-wrap gap-3">
          {project.links.source ? (
            <GlowButton href={project.links.source} external>
              View source
            </GlowButton>
          ) : null}
          {project.links.live ? (
            <GlowButton href={project.links.live} variant="ghost" external>
              View live
            </GlowButton>
          ) : null}
        </div>
      </header>

      <section className="mt-16">
        <h2 className="font-mono text-sm tracking-widest text-purple uppercase">
          The problem
        </h2>
        <p className="mt-3 text-muted">{study.problem}</p>
      </section>

      <section className="mt-12">
        <h2 className="font-mono text-sm tracking-widest text-purple uppercase">
          Architecture
        </h2>
        <dl className="mt-4 space-y-3">
          {study.architecture.map((row) => (
            <div key={row.layer} className="grid gap-1 sm:grid-cols-[10rem_1fr]">
              <dt className="font-mono text-sm text-cyan">{row.layer}</dt>
              <dd className="text-muted">{row.detail}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-12">
        <h2 className="font-mono text-sm tracking-widest text-purple uppercase">
          What it does
        </h2>
        <ul className="mt-4 space-y-2">
          {study.features.map((feature) => (
            <li key={feature} className="text-muted">
              <span aria-hidden className="mr-2 text-green">
                &#9670;
              </span>
              {feature}
            </li>
          ))}
        </ul>
      </section>

      {study.planned.length > 0 ? (
        <section className="mt-12">
          <Panel accent="purple" className="p-5">
            <h2 className="font-mono text-sm tracking-widest text-purple uppercase">
              Not built yet
            </h2>
            <p className="mt-2 text-sm text-muted">
              Listed separately because it is not in the code today.
            </p>
            <ul className="mt-4 space-y-2">
              {study.planned.map((item) => (
                <li key={item} className="text-muted">
                  <span aria-hidden className="mr-2 text-hairline">
                    &#9671;
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </Panel>
        </section>
      ) : null}

      <section className="mt-12">
        <h2 className="font-mono text-sm tracking-widest text-purple uppercase">
          What I learned
        </h2>
        <p className="mt-3 text-muted">{study.learned}</p>
      </section>
    </article>
  );
}
