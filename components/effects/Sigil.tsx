"use client";

import { createRng, seedFrom } from "@/lib/art";
import { useCanvasScene } from "@/lib/hooks/useCanvasScene";

const HUES = ["57,255,136", "0,229,255", "155,92,255"] as const;

/**
 * A geometric seal drawn behind each Spellbook panel: two concentric rings and
 * a star polygon whose point count and step are seeded from the group name, so
 * each group carries its own mark.
 *
 * Drawn once and left still — the slow rotation is a CSS animation on the
 * wrapper, which costs nothing and disappears entirely under reduced motion.
 * That is why this component never animates its own canvas.
 */
export function Sigil({ seed, className = "" }: { seed: string; className?: string }) {
  const ref = useCanvasScene(
    (ctx, { width, height }) => {
      const value = seedFrom(seed);
      const rand = createRng(value);
      const hue = HUES[value % HUES.length];

      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.min(width, height) * 0.38;

      ctx.lineWidth = 1;
      ctx.strokeStyle = `rgba(${hue},0.30)`;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.66, 0, Math.PI * 2);
      ctx.stroke();

      const points = 5 + Math.floor(rand() * 4);
      const vertices = Array.from({ length: points }, (_, i) => {
        const angle = (i / points) * Math.PI * 2 - Math.PI / 2;
        return { x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius };
      });

      // Stepping by more than one vertex is what turns a polygon into a star.
      // The step must be coprime with the point count, or the path revisits a
      // subset of vertices and closes with a bare chord across the seal
      // instead of drawing a complete star.
      const step = starStep(points, rand);
      ctx.beginPath();
      for (let i = 0; i <= points; i += 1) {
        const v = vertices[(i * step) % points];
        if (i === 0) ctx.moveTo(v.x, v.y);
        else ctx.lineTo(v.x, v.y);
      }
      ctx.strokeStyle = `rgba(${hue},0.42)`;
      ctx.stroke();

      for (const v of vertices) {
        ctx.beginPath();
        ctx.arc(v.x, v.y, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${hue},0.6)`;
        ctx.fill();
      }
    },
    { animate: false },
  );

  return <canvas ref={ref} aria-hidden data-scene="sigil" className={className} />;
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

/** A step coprime with `points`, so the star visits every vertex exactly once
 *  and returns to its start. Falls back to 2 when no larger step qualifies. */
function starStep(points: number, rand: () => number): number {
  const candidates: number[] = [];
  for (let step = 2; step <= Math.floor(points / 2); step += 1) {
    if (gcd(step, points) === 1) candidates.push(step);
  }
  if (candidates.length === 0) return 2;
  return candidates[Math.floor(rand() * candidates.length)];
}
