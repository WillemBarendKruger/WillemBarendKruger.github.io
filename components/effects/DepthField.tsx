"use client";

import { useEffect, useRef } from "react";
import { createRng, seedFrom } from "@/lib/art";
import { useCanvasScene } from "@/lib/hooks/useCanvasScene";

type Point = { x: number; y: number; z: number };

const NEAR = 0.22;
const FAR = 3.25;

/**
 * The hero particle field, given a real z-axis.
 *
 * Points drift toward the viewer through a perspective divide, so near ones
 * are large and bright and far ones are small and dim, and the field reads as
 * space rather than as confetti scattered on a flat plane. The whole field
 * also shifts gently against the pointer, which sells the depth more than the
 * drift does.
 *
 * Replaces the earlier flat ParticleField. Same cost profile: count scales
 * with viewport area so phones draw far fewer, and the shared canvas hook
 * stops the loop entirely once the hero scrolls away.
 */
export function DepthField({ className = "" }: { className?: string }) {
  const points = useRef<Point[] | null>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const lastTime = useRef(0);

  const ref = useCanvasScene((ctx, { width, height }, time) => {
    const count = Math.min(150, Math.round((width * height) / 9000));

    if (!points.current || points.current.length !== count) {
      const rand = createRng(seedFrom("willem-kruger-depth-field"));
      points.current = Array.from({ length: count }, () => ({
        x: (rand() - 0.5) * 2.4,
        y: (rand() - 0.5) * 2.4,
        z: NEAR + rand() * (FAR - NEAR),
      }));
    }

    const delta = time === 0 ? 0 : Math.min(time - lastTime.current, 50);
    lastTime.current = time;

    const cx = width / 2;
    const cy = height / 2;
    const focal = Math.min(width, height) * 0.62;

    for (const p of points.current) {
      if (delta > 0) {
        p.z -= delta * 0.00016;
        if (p.z <= NEAR) {
          // Recycle to the back rather than allocating a new point.
          p.z = FAR;
          p.x = (Math.random() - 0.5) * 2.4;
          p.y = (Math.random() - 0.5) * 2.4;
        }
      }

      const sx = cx + ((p.x + pointer.current.x * 0.35) / p.z) * focal;
      const sy = cy + ((p.y + pointer.current.y * 0.35) / p.z) * focal;
      if (sx < -20 || sx > width + 20 || sy < -20 || sy > height + 20) continue;

      const near = 1 - Math.min(p.z / FAR, 1);
      ctx.beginPath();
      ctx.arc(sx, sy, 0.4 + near * 2.4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(155,92,255,${(0.15 + near * 0.55).toFixed(3)})`;
      ctx.fill();
    }
  });

  // Pointer parallax. Attached to the window rather than the canvas because
  // the canvas is pointer-events:none — it must never intercept a click meant
  // for the buttons sitting on top of it.
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const onMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      pointer.current = {
        x: (event.clientX - rect.left) / rect.width - 0.5,
        y: (event.clientY - rect.top) / rect.height - 0.5,
      };
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [ref]);

  return <canvas ref={ref} aria-hidden data-scene="depth-field" className={className} />;
}
