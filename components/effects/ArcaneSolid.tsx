"use client";

import { ICOSAHEDRON, depthMix, project, rotate } from "@/lib/art";
import { useCanvasScene } from "@/lib/hooks/useCanvasScene";

/**
 * A wireframe icosahedron turning on two axes, with glowing vertices and a
 * tilted orbiting ring.
 *
 * This is real 3D — vertices rotated by trigonometry and projected through a
 * perspective divide — drawn on a 2D canvas rather than through a 3D engine,
 * which keeps it at zero bytes of dependency. A rotating polyhedron also reads
 * as an arcane object rather than as a graphics demo, which is the point: it
 * gives the site a signature mark that belongs to its own theme.
 *
 * At time 0 (reduced motion, or before the loop starts) it renders at a fixed,
 * deliberately three-quarter angle, so the still frame still reads as a solid.
 */
export function ArcaneSolid({ className = "" }: { className?: string }) {
  const ref = useCanvasScene((ctx, { width, height }, time) => {
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) * 0.34;
    const view = { cx, cy, radius };

    // A resting pose that shows depth, plus slow tumble once animating.
    const angleX = 0.55 + time * 0.00022;
    const angleY = 0.4 + time * 0.00035;

    const points = ICOSAHEDRON.vertices.map((v) =>
      project(rotate(v, angleX, angleY), view),
    );

    for (const [a, b] of ICOSAHEDRON.edges) {
      const p = points[a];
      const q = points[b];
      const near = depthMix((p.z + q.z) / 2);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(q.x, q.y);
      ctx.strokeStyle = `rgba(57,255,136,${(0.16 + near * 0.5).toFixed(3)})`;
      ctx.lineWidth = 0.8 + near * 1.1;
      ctx.stroke();
    }

    for (const p of points) {
      const near = depthMix(p.z);
      const r = 7 * p.scale;
      const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
      glow.addColorStop(0, `rgba(155,92,255,${(0.25 + near * 0.7).toFixed(3)})`);
      glow.addColorStop(1, "rgba(155,92,255,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Orbiting ring, tilted against the solid's own rotation.
    const tilt = angleX * 2.1;
    ctx.beginPath();
    for (let i = 0; i <= 72; i += 1) {
      const t = (i / 72) * Math.PI * 2;
      const ringX = Math.cos(t) * 1.32;
      const ringZ = Math.sin(t) * 1.32;
      const p = project(
        { x: ringX, y: ringZ * Math.sin(tilt) * 0.42, z: ringZ * Math.cos(tilt) },
        view,
      );
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.strokeStyle = "rgba(0,229,255,0.35)";
    ctx.lineWidth = 1;
    ctx.stroke();
  });

  return <canvas ref={ref} aria-hidden data-scene="arcane-solid" className={className} />;
}
