import { ArcaneSolid } from "@/components/effects/ArcaneSolid";
import { BootOverlay } from "@/components/effects/BootOverlay";
import { DepthField } from "@/components/effects/DepthField";
import { GlowButton } from "@/components/ui/GlowButton";
import { profile } from "@/data/profile";

const STACK = ["C#", ".NET", "TypeScript", "React", "Azure"];

export function Hero() {
  const github = profile.links.find((link) => link.label === "GitHub");

  return (
    <section className="relative flex min-h-screen items-center overflow-hidden px-4">
      <DepthField className="pointer-events-none absolute inset-0 size-full" />
      <BootOverlay />

      <div className="relative mx-auto grid w-full max-w-5xl items-center gap-12 py-28 lg:grid-cols-[1fr_auto]">
        <div>
          <p className="font-mono text-xs tracking-[0.3em] text-green uppercase">
            System online
          </p>
          <h1 className="mt-5 font-mono text-5xl leading-[1.02] font-bold tracking-tight text-text sm:text-7xl">
            {profile.name}
          </h1>
          <p className="mt-5 font-mono text-lg text-purple sm:text-xl">
            {profile.epithet} &middot; {profile.role}
          </p>
          <p className="mt-7 max-w-xl text-lg text-muted">
            I build systems that turn ideas into working software — backend
            first, with the interfaces that make them usable.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <GlowButton href="#projects">Enter the grimoire</GlowButton>
            {github ? (
              <GlowButton href={github.href} variant="ghost" external>
                View GitHub
              </GlowButton>
            ) : null}
          </div>
          <ul className="mt-14 flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs tracking-widest text-muted uppercase">
            {STACK.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        {/* The site's signature object. Hidden below lg — on a phone it would
            push the actual content off the first screen for pure decoration. */}
        <ArcaneSolid className="hidden size-80 lg:block" />
      </div>
    </section>
  );
}
