import { Connect } from "@/components/sections/Connect";
import { FeaturedProjects } from "@/components/sections/FeaturedProjects";
import { Hero } from "@/components/sections/Hero";
import { Identity } from "@/components/sections/Identity";
import { QuestLog } from "@/components/sections/QuestLog";
import { Spellbook } from "@/components/sections/Spellbook";
import { Timeline } from "@/components/sections/Timeline";

export default function Home() {
  return (
    <>
      <Hero />
      <Identity />
      <Spellbook />
      <FeaturedProjects />
      <Timeline />
      <QuestLog />
      <Connect />
    </>
  );
}
