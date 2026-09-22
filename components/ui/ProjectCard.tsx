import Image from "next/image";
import Link from "next/link";
import { CardArt } from "@/components/effects/CardArt";
import { Panel } from "@/components/ui/Panel";
import { Tag } from "@/components/ui/Tag";
import { TiltCard } from "@/components/ui/TiltCard";
import type { Project } from "@/data/types";

export function ProjectCard({ project }: { project: Project }) {
  const body = (
    <Panel
      accent={project.featured ? "cyan" : "purple"}
      className="flex h-full flex-col overflow-hidden"
    >
      {/* Art leads the card. A real screenshot wins when there is one;
          otherwise generated artwork stands in, so no project is a wall of
          text and the strongest work is not the least visual. */}
      <div className="relative aspect-video w-full shrink-0 border-b border-hairline/25">
        {project.image ? (
          <Image
            src={project.image}
            // Decorative: the project name and tagline directly below carry
            // the meaning, so alt text here would only repeat them.
            alt=""
            width={project.imageWidth ?? 640}
            height={project.imageHeight ?? 360}
            className="size-full object-cover"
          />
        ) : (
          <CardArt
            slug={project.slug}
            letter={project.name.charAt(0)}
            // Only the two featured cards animate. Seven more looping
            // canvases would be a permanent cost for very little gain.
            animate={project.featured}
            className="size-full"
          />
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
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
          <p className="mt-auto pt-4 font-mono text-xs text-cyan">
            Read the case study &rarr;
          </p>
        ) : (
          <p className="mt-auto pt-4 font-mono text-xs text-muted">
            View source &rarr;
          </p>
        )}
      </div>
    </Panel>
  );

  const tilted = <TiltCard className="h-full">{body}</TiltCard>;

  if (project.featured) {
    return (
      <Link
        href={`/projects/${project.slug}/`}
        prefetch={false}
        className="block h-full"
      >
        {tilted}
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
      {tilted}
    </a>
  ) : (
    tilted
  );
}
