import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { timeline } from "@/data/timeline";

export function Timeline() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-24 sm:py-32">
      <SectionHeading
        id="timeline"
        index="04 // Quest log"
        title="How I got here"
      />
      <ol className="relative border-l border-hairline/40 pl-6">
        {timeline.map((entry, index) => (
          <li key={entry.title} className="pb-10 last:pb-0">
            <span
              aria-hidden
              className="node-pulse absolute -left-[5px] size-2.5 rounded-full bg-purple"
            />
            <Reveal delayMs={index * 60}>
              <p className="font-mono text-xs tracking-widest text-purple uppercase">
                {entry.period}
              </p>
              <h3 className="mt-1 font-mono text-lg text-text">{entry.title}</h3>
              {entry.org ? (
                <p className="font-mono text-sm text-cyan">{entry.org}</p>
              ) : null}
              <p className="mt-2 text-muted">{entry.detail}</p>
            </Reveal>
          </li>
        ))}
      </ol>
    </section>
  );
}
