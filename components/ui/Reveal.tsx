"use client";

import type { ReactNode } from "react";
import { useInView } from "@/lib/hooks/useInView";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";

export function Reveal({
  children,
  delayMs = 0,
}: {
  children: ReactNode;
  delayMs?: number;
}) {
  const reduced = usePrefersReducedMotion();
  const { ref, inView } = useInView<HTMLDivElement>();

  // The ref must be attached on EVERY render path. The reduced-motion branch
  // used to return a different element without it, so the observer was created
  // against a null ref during hydration and — because subscribe is identity
  // stable — never re-created once motion was permitted.
  //
  // Transform only, never opacity: fading text through low-alpha states
  // during the transition would fail color-contrast at that instant (real
  // for anyone loading the page without scrolling, and reliably caught by
  // an axe scan taken right after `page.goto`). Text stays fully opaque and
  // readable throughout; only the slide-up motion is animated. Under reduced
  // motion the element carries no className and no style at all, so no
  // animation can leak.
  return (
    <div
      ref={ref}
      style={reduced ? undefined : { transitionDelay: `${delayMs}ms` }}
      className={
        reduced
          ? undefined
          : `transition-transform duration-700 ease-out ${inView ? "translate-y-0" : "translate-y-4"}`
      }
    >
      {children}
    </div>
  );
}
