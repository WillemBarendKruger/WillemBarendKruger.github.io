import { Panel } from "@/components/ui/Panel";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { quests } from "@/data/quests";

export function QuestLog() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-24">
      <SectionHeading
        id="quests"
        index="05 // Active quests"
        title="What I'm learning now"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {quests.map((quest, index) => (
          <Reveal key={quest.title} delayMs={index * 70}>
            <Panel accent="green" className="h-full p-5">
              <p className="font-mono text-xs tracking-widest text-green uppercase">
                [{quest.status}]
              </p>
              <h3 className="mt-2 font-mono text-lg text-text">{quest.title}</h3>
              <p className="mt-2 text-sm text-muted">{quest.detail}</p>
            </Panel>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
