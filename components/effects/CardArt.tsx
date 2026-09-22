"use client";

import { useRef } from "react";
import { createRng, seedFrom } from "@/lib/art";
import { useCanvasScene } from "@/lib/hooks/useCanvasScene";

type Pt = { x: number; y: number };

type Built = {
  base: HTMLCanvasElement | null;
  paths: Pt[][];
  hue: string;
  width: number;
  height: number;
};

const HUES = ["57,255,136", "0,229,255", "155,92,255"] as const;
const GRID = 22;

/**
 * Generated artwork for a project that has no screenshot.
 *
 * Circuit traces on a faint grid, with the project's initial set large and
 * translucent behind them. Everything is seeded from the slug, so a project's
 * mark is stable across builds — and it is unmistakably a generated pattern
 * rather than a screenshot, which matters: the site must never imply it is
 * showing you a real screen when it is not.
 *
 * On featured cards a light pulse travels each trace. On the smaller cards the
 * art is drawn once and left still, which keeps seven extra canvases off the
 * animation loop.
 */
export function CardArt({
  slug,
  letter,
  animate = false,
  className = "",
}: {
  slug: string;
  letter: string;
  animate?: boolean;
  className?: string;
}) {
  const built = useRef<Built | null>(null);

  const ref = useCanvasScene(
    (ctx, { width, height }, time) => {
      if (
        !built.current ||
        built.current.width !== width ||
        built.current.height !== height
      ) {
        built.current = build(slug, letter, width, height);
      }

      const { base, paths, hue } = built.current;

      if (base) ctx.drawImage(base, 0, 0, width, height);
      else drawStatic(ctx, slug, letter, width, height);

      if (!animate || time === 0) return;

      // One pulse per trace, staggered so they never march in step.
      const phase = createRng(seedFrom(slug))();
      paths.forEach((path, index) => {
        const t = (time / 5200 + phase + index * 0.17) % 1;
        const p = pointAlong(path, t);
        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 9);
        glow.addColorStop(0, `rgba(${hue},0.85)`);
        glow.addColorStop(1, `rgba(${hue},0)`);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 9, 0, Math.PI * 2);
        ctx.fill();
      });
    },
    { animate },
  );

  return <canvas ref={ref} aria-hidden data-scene="card-art" className={className} />;
}

/** Draws the static layer into an offscreen canvas so the animated cards blit
 *  one image per frame instead of re-stroking the whole circuit. */
function build(slug: string, letter: string, width: number, height: number): Built {
  const seed = seedFrom(slug);
  const hue = HUES[seed % HUES.length];

  let base: HTMLCanvasElement | null = null;
  const paths: Pt[][] = [];

  if (typeof document !== "undefined") {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const offscreen = document.createElement("canvas");
    offscreen.width = Math.round(width * dpr);
    offscreen.height = Math.round(height * dpr);
    const ctx = offscreen.getContext("2d");
    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      paths.push(...drawStatic(ctx, slug, letter, width, height));
      base = offscreen;
    }
  }

  return { base, paths, hue, width, height };
}

function drawStatic(
  ctx: CanvasRenderingContext2D,
  slug: string,
  letter: string,
  width: number,
  height: number,
): Pt[][] {
  const seed = seedFrom(slug);
  const rand = createRng(seed);
  const hue = HUES[seed % HUES.length];

  ctx.strokeStyle = "rgba(110,118,129,0.13)";
  ctx.lineWidth = 1;
  for (let x = GRID; x < width; x += GRID) {
    ctx.beginPath();
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, height);
    ctx.stroke();
  }
  for (let y = GRID; y < height; y += GRID) {
    ctx.beginPath();
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(width, y + 0.5);
    ctx.stroke();
  }

  const paths: Pt[][] = [];
  const traceCount = 5 + Math.floor(rand() * 3);

  for (let t = 0; t < traceCount; t += 1) {
    let px = Math.round(rand() * (width / GRID)) * GRID;
    let py = Math.round(rand() * (height / GRID)) * GRID;
    const path: Pt[] = [{ x: px, y: py }];

    const segments = 2 + Math.floor(rand() * 3);
    for (let s = 0; s < segments; s += 1) {
      if (rand() > 0.5) px += (rand() > 0.5 ? 1 : -1) * GRID * (1 + Math.floor(rand() * 3));
      else py += (rand() > 0.5 ? 1 : -1) * GRID * (1 + Math.floor(rand() * 2));
      path.push({ x: px, y: py });
    }

    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);
    for (let i = 1; i < path.length; i += 1) ctx.lineTo(path[i].x, path[i].y);
    ctx.strokeStyle = `rgba(${hue},${(0.2 + rand() * 0.28).toFixed(3)})`;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(px, py, 2.4, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${hue},0.75)`;
    ctx.fill();

    paths.push(path);
  }

  ctx.font = `700 ${Math.round(height * 0.62)}px var(--font-jetbrains-mono), monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = `rgba(${hue},0.22)`;
  ctx.fillText(letter, width * 0.5, height * 0.54);

  const edge = ctx.createLinearGradient(0, height - 2, width, height);
  edge.addColorStop(0, "rgba(0,0,0,0)");
  edge.addColorStop(0.5, `rgba(${hue},0.5)`);
  edge.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = edge;
  ctx.fillRect(0, height - 1.5, width, 1.5);

  return paths;
}

/** Position a fraction `t` along a polyline, measured in Manhattan distance —
 *  the traces are orthogonal, so that is their true arc length. */
function pointAlong(path: Pt[], t: number): Pt {
  if (path.length < 2) return path[0] ?? { x: 0, y: 0 };

  const lengths: number[] = [];
  let total = 0;
  for (let i = 1; i < path.length; i += 1) {
    const d = Math.abs(path[i].x - path[i - 1].x) + Math.abs(path[i].y - path[i - 1].y);
    lengths.push(d);
    total += d;
  }
  if (total === 0) return path[0];

  const target = t * total;
  let travelled = 0;
  for (let i = 0; i < lengths.length; i += 1) {
    if (travelled + lengths[i] >= target) {
      const local = lengths[i] ? (target - travelled) / lengths[i] : 0;
      return {
        x: path[i].x + (path[i + 1].x - path[i].x) * local,
        y: path[i].y + (path[i + 1].y - path[i].y) * local,
      };
    }
    travelled += lengths[i];
  }
  return path[path.length - 1];
}
