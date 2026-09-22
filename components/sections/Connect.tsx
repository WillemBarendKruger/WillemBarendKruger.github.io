import { GlowButton } from "@/components/ui/GlowButton";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { profile } from "@/data/profile";

export function Connect() {
  return (
    // A <footer> here would sit inside the layout's <main>, where it is not a
    // page-level contentinfo landmark — the element would misrepresent itself.
    <section className="mx-auto max-w-3xl px-4 py-24 sm:py-32">
      <SectionHeading
        id="connect"
        index="06 // Establish connection"
        title="Get in touch"
        blurb="Open to conversations about backend work, .NET, and anything cloud."
      />
      <div className="flex flex-wrap gap-3">
        <GlowButton href={`mailto:${profile.email}`} external>
          {profile.email}
        </GlowButton>
        {profile.links.map((link) => (
          <GlowButton key={link.href} href={link.href} variant="ghost" external>
            {link.label}
          </GlowButton>
        ))}
      </div>
      <p className="mt-16 font-mono text-xs text-muted">
        &copy; {new Date().getFullYear()} {profile.name}. Built with Next.js and
        TypeScript.{" "}
        <a
          href="https://github.com/WillemBarendKruger/WillemBarendKruger.github.io"
          target="_blank"
          rel="noreferrer noopener"
          className="underline decoration-hairline underline-offset-4 hover:text-cyan"
        >
          Source
        </a>
        .
      </p>
    </section>
  );
}
