export function SectionHeading({
  id,
  index,
  title,
  blurb,
}: {
  id: string;
  index: string;
  title: string;
  blurb?: string;
}) {
  return (
    // Hierarchy comes from scale, not from borders and boxes: the title runs
    // large enough to carry the section on its own.
    <header className="mb-12">
      <p className="font-mono text-xs tracking-[0.3em] text-purple uppercase">
        {index}
      </p>
      <h2
        id={id}
        className="mt-3 max-w-3xl font-mono text-3xl leading-[1.1] tracking-tight text-balance text-text sm:text-4xl lg:text-5xl"
      >
        {title}
      </h2>
      {blurb ? <p className="mt-5 max-w-2xl text-muted">{blurb}</p> : null}
    </header>
  );
}
