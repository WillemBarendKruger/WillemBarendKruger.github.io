import { BootOverlay } from "@/components/effects/BootOverlay";
import { ParticleField } from "@/components/effects/ParticleField";
import { GlowButton } from "@/components/ui/GlowButton";
import { profile } from "@/data/profile";

const STACK = ["C#", ".NET", "TypeScript", "React", "Azure"];

export function Hero() {
  const github = profile.links.find((link) => link.label === "GitHub");

  return (
    <section className="relative flex min-h-screen items-center overflow-hidden px-4">
      <ParticleField />
      <BootOverlay />
      <div className="relative mx-auto w-full max-w-4xl py-24">
        <p className="font-mono text-xs tracking-[0.3em] text-green uppercase">
          System online
        </p>
        <h1 className="mt-4 font-mono text-4xl leading-tight text-text sm:text-6xl">
          {profile.name}
        </h1>
        <p className="mt-4 font-mono text-lg text-purple sm:text-xl">
          {profile.epithet} &middot; {profile.role}
        </p>
        <p className="mt-6 max-w-xl text-lg text-muted">
          I build systems that turn ideas into working software — backend first,
          with the interfaces that make them usable.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <GlowButton href="#projects">Enter the grimoire</GlowButton>
          {github ? (
            <GlowButton href={github.href} variant="ghost" external>
              View GitHub
            </GlowButton>
          ) : null}
        </div>
        <ul className="mt-12 flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs tracking-widest text-muted uppercase">
          {STACK.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
