import Image from "next/image";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TerminalFrame } from "@/components/ui/TerminalFrame";
import { profile } from "@/data/profile";

export function Identity() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-24">
      <SectionHeading id="identity" index="01 // Identity" title="Who is typing" />
      <TerminalFrame title="willem@grimoire — whoami">
        <p className="text-green">&gt; whoami</p>
        <dl className="mt-4 grid gap-1 sm:grid-cols-[10rem_1fr]">
          <dt className="text-muted">name</dt>
          <dd className="text-text">{profile.name}</dd>
          <dt className="text-muted">role</dt>
          <dd className="text-text">{profile.role}</dd>
          <dt className="text-muted">focus</dt>
          <dd className="text-text">Backend / .NET</dd>
          <dt className="text-muted">location</dt>
          <dd className="text-text">{profile.location}</dd>
        </dl>
      </TerminalFrame>
      <div className="mt-10 flex flex-col gap-8 sm:flex-row sm:items-start">
        <Image
          src="/images/profile.png"
          alt="Willem Kruger"
          width={160}
          height={240}
          className="w-40 shrink-0 rounded-sm border border-hairline/40 object-cover"
        />
        <div className="space-y-4 text-muted">
          {profile.summary.map((paragraph) => (
            <p key={paragraph.slice(0, 40)}>{paragraph}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
