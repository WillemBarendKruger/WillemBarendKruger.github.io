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
    <header className="mb-10">
      <p className="font-mono text-xs tracking-[0.3em] text-purple uppercase">
        {index}
      </p>
      <h2 id={id} className="mt-2 font-mono text-2xl text-text sm:text-3xl">
        {title}
      </h2>
      {blurb ? <p className="mt-3 max-w-2xl text-muted">{blurb}</p> : null}
    </header>
  );
}
