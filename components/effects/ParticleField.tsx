"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";

type Particle = { x: number; y: number; vx: number; vy: number; r: number };

export function ParticleField() {
  const reduced = usePrefersReducedMotion();
  const hostRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  // Deliberately NOT latched, unlike useInView: the hero's particle field
  // should stop costing a requestAnimationFrame loop once scrolled past, and
  // resume if the user scrolls back up. `visible` starts true so the canvas
  // (and its animation) is present for the common case — page loaded at the
  // top — before the observer's first callback confirms it.
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (reduced) return;
    const host = hostRef.current;
    if (!host || typeof IntersectionObserver !== "function") return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      threshold: 0,
    });
    observer.observe(host);
    return () => observer.disconnect();
  }, [reduced]);

  useEffect(() => {
    if (reduced || !visible) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let frame = 0;
    let particles: Particle[] = [];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      // Assigning canvas.width/height resets the 2D context transform to the
      // identity matrix, so this scale is applied fresh each resize rather
      // than compounding with whatever scale was set on a previous resize.
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
      // Scale count to area so phones render far fewer particles.
      const count = Math.min(90, Math.round((canvas.offsetWidth * canvas.offsetHeight) / 14000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.4 + 0.4,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      for (const p of particles) {
        p.x = (p.x + p.vx + canvas.offsetWidth) % canvas.offsetWidth;
        p.y = (p.y + p.vy + canvas.offsetHeight) % canvas.offsetHeight;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(155, 92, 255, 0.5)";
        ctx.fill();
      }
      frame = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, [reduced, visible]);

  if (reduced) return null;

  return (
    <div ref={hostRef} className="pointer-events-none absolute inset-0 size-full">
      {visible ? (
        <canvas ref={canvasRef} aria-hidden className="size-full opacity-60" />
      ) : null}
    </div>
  );
}
