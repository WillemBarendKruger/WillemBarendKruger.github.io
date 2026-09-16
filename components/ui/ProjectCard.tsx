import Image from "next/image";
import Link from "next/link";
import { Panel } from "@/components/ui/Panel";
import { Tag } from "@/components/ui/Tag";
import type { Project } from "@/data/types";

export function ProjectCard({ project }: { project: Project }) {
  const body = (
    <Panel accent={project.featured ? "cyan" : "purple"} className="h-full p-5">
      {project.image ? (
        <Image
          src={project.image}
          // Decorative: the project name and tagline directly below carry the
          // meaning, so alt text here would only repeat them.
          alt=""
          width={640}
          height={360}
          className="mb-4 w-full rounded-sm border border-hairline/30 object-cover"
        />
      ) : null}
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-mono text-lg text-text">{project.name}</h3>
        {project.collaboration === "team" ? (
          <span className="shrink-0 font-mono text-xs text-purple">team</span>
        ) : null}
      </div>
      <p className="mt-2 text-sm text-muted">{project.tagline}</p>
      <ul className="mt-4 flex flex-wrap gap-2">
        {project.technologies.slice(0, 6).map((tech) => (
          <li key={tech}>
            <Tag>{tech}</Tag>
          </li>
        ))}
      </ul>
      {project.featured ? (
        <p className="mt-4 font-mono text-xs text-cyan">Read the case study &rarr;</p>
      ) : (
        <p className="mt-4 font-mono text-xs text-muted">View source &rarr;</p>
      )}
    </Panel>
  );

  if (project.featured) {
    return (
      <Link href={`/projects/${project.slug}/`} className="block h-full">
        {body}
      </Link>
    );
  }
  return project.links.source ? (
    <a
      href={project.links.source}
      target="_blank"
      rel="noreferrer noopener"
      className="block h-full"
    >
      {body}
    </a>
  ) : (
    body
  );
}
