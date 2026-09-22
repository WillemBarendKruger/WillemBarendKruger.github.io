/**
 * A hairline that fades in from nothing, peaks at the arcane purple, and fades
 * back out — a circuit trace rather than a rule. Gives the eye a rest point
 * between sections now that they sit much further apart.
 *
 * Decorative, so it is `aria-hidden` and carries no semantic separator role:
 * the section headings already convey the structure to a screen reader.
 */
export function SectionDivider() {
  return (
    <div aria-hidden className="mx-auto max-w-5xl px-4">
      <div className="h-px bg-[linear-gradient(90deg,transparent,rgb(155_92_255/0.55),transparent)]" />
    </div>
  );
}
