"use client";

import { useCallback, useRef, type ReactNode } from "react";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";

const MAX_TILT_X = 8;
const MAX_TILT_Y = 10;

/**
 * Gives a card real perspective: it rotates toward the pointer, and a soft
 * glare follows the cursor across it.
 *
 * CSS transforms only, so this costs nothing beyond a pointer handler, and it
 * simply never fires on a touch device or under reduced motion — where the
 * wrapper renders as a plain box with no transform and no glare element at all.
 *
 * The transform is written straight to style rather than held in state: a
 * pointermove firing at screen rate would otherwise re-render on every frame.
 */
export function TiltCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduced = usePrefersReducedMotion();
  const tiltRef = useRef<HTMLDivElement | null>(null);
  const glareRef = useRef<HTMLDivElement | null>(null);

  const onPointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const node = tiltRef.current;
    if (!node) return;

    const rect = node.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;

    node.style.transform =
      `rotateX(${((0.5 - py) * MAX_TILT_X).toFixed(2)}deg) ` +
      `rotateY(${((px - 0.5) * MAX_TILT_Y).toFixed(2)}deg)`;

    const glare = glareRef.current;
    if (glare) {
      glare.style.setProperty("--glare-x", `${(px * 100).toFixed(1)}%`);
      glare.style.setProperty("--glare-y", `${(py * 100).toFixed(1)}%`);
      glare.style.opacity = "1";
    }
  }, []);

  const onPointerLeave = useCallback(() => {
    const node = tiltRef.current;
    if (node) node.style.transform = "";
    const glare = glareRef.current;
    if (glare) glare.style.opacity = "0";
  }, []);

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={`[perspective:900px] ${className}`}>
      <div
        ref={tiltRef}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        className="relative h-full transition-transform duration-200 ease-out [transform-style:preserve-3d]"
      >
        {children}
        <div
          ref={glareRef}
          aria-hidden
          style={{ opacity: 0 }}
          className="pointer-events-none absolute inset-0 rounded-sm bg-[radial-gradient(circle_at_var(--glare-x,50%)_var(--glare-y,50%),rgb(255_255_255/0.07),transparent_55%)] transition-opacity duration-200"
        />
      </div>
    </div>
  );
}
