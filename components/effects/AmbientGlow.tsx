/**
 * Three heavily-blurred colour fields behind the whole page.
 *
 * This is what stops the background reading as one flat dead colour. It is a
 * server component with no JavaScript at all — the drift is CSS, declared only
 * under `prefers-reduced-motion: no-preference` in globals.css, so a reader who
 * asks for reduced motion gets the same colour with no movement.
 *
 * Purely decorative and `aria-hidden`: it sits behind the content at low alpha
 * and never affects the contrast of anything readable.
 */
export function AmbientGlow() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <span className="ambient-a absolute -top-72 -left-60 block size-[46rem] rounded-full bg-[radial-gradient(circle,rgb(57_255_136/0.13),transparent_68%)] blur-[90px]" />
      <span className="ambient-b absolute top-[38%] -right-68 block size-[42rem] rounded-full bg-[radial-gradient(circle,rgb(155_92_255/0.15),transparent_68%)] blur-[90px]" />
      <span className="ambient-c absolute -bottom-48 left-[22%] block size-[34rem] rounded-full bg-[radial-gradient(circle,rgb(0_229_255/0.09),transparent_68%)] blur-[90px]" />
    </div>
  );
}
