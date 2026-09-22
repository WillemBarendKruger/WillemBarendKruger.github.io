import { AmbientGlow } from "@/components/effects/AmbientGlow";
import { Connect } from "@/components/sections/Connect";
import { FeaturedProjects } from "@/components/sections/FeaturedProjects";
import { Hero } from "@/components/sections/Hero";
import { Identity } from "@/components/sections/Identity";
import { QuestLog } from "@/components/sections/QuestLog";
import { Spellbook } from "@/components/sections/Spellbook";
import { Timeline } from "@/components/sections/Timeline";
import { SectionDivider } from "@/components/ui/SectionDivider";

export default function Home() {
  return (
    <>
      <AmbientGlow />
      <Hero />
      <SectionDivider />
      <Identity />
      <SectionDivider />
      <Spellbook />
      <SectionDivider />
      <FeaturedProjects />
      <SectionDivider />
      <Timeline />
      <SectionDivider />
      <QuestLog />
      <SectionDivider />
      <Connect />
    </>
  );
}
