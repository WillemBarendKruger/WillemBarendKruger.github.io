import { Sigil } from "@/components/effects/Sigil";
import { Panel } from "@/components/ui/Panel";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Tag } from "@/components/ui/Tag";
import { skillGroups } from "@/data/skills";

export function Spellbook() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-24 sm:py-32">
      <SectionHeading
        id="spellbook"
        index="02 // Spellbook"
        title="What I work with"
        blurb="Grouped by where they sit in a system, not ranked. A percentage next to a language name would not tell you anything true."
      />
      <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
        {skillGroups.map((group, index) => (
          <Reveal key={group.id} delayMs={index * 80}>
            <Panel accent="purple" className="relative h-full overflow-hidden p-5">
              {/* Arcane seal watermark. This was the emptiest section on the
                  page; the sigil gives it texture without adding words. */}
              <Sigil
                seed={group.id}
                className="sigil-turn pointer-events-none absolute -top-4 -right-4 size-32"
              />
              <h3 className="relative font-mono text-sm tracking-widest text-purple uppercase">
                {group.title}
              </h3>
              <p className="relative mt-2 text-sm text-muted">{group.blurb}</p>
              <ul className="relative mt-4 flex flex-wrap gap-2">
                {group.skills.map((skill) => (
                  <li key={skill}>
                    <Tag>{skill}</Tag>
                  </li>
                ))}
              </ul>
            </Panel>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
