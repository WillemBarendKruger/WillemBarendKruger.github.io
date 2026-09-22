"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";

export type SceneSize = { width: number; height: number };

/**
 * Draws one frame. `time` is milliseconds since the scene started animating,
 * and is 0 for the single still frame drawn when motion is not permitted — so
 * a scene can render a sensible resting state by treating time 0 as "at rest".
 */
export type SceneDraw = (
  ctx: CanvasRenderingContext2D,
  size: SceneSize,
  time: number,
) => void;

type Options = {
  /** false renders exactly one still frame and never starts a loop. */
  animate?: boolean;
};

/**
 * Canvas plumbing shared by every generated-artwork component: device-pixel
 * sizing, redraw on resize, and an animation loop that only runs when the
 * canvas is on screen AND the reader permits motion.
 *
 * The visibility gate matters more than it looks. Without it every canvas on
 * the page animates forever, which on a long portfolio means a permanent CPU
 * and battery cost for artwork nobody is looking at.
 *
 * A still frame is always drawn, so the scene is complete under reduced motion
 * and for anyone who never scrolls it into view.
 */
export function useCanvasScene(
  draw: SceneDraw,
  { animate = true }: Options = {},
) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawRef = useRef(draw);
  const reduced = usePrefersReducedMotion();

  // Keep the latest draw function without making it an effect dependency:
  // callers routinely pass an inline closure, which would otherwise tear down
  // and rebuild the loop on every render. Synced in an effect rather than
  // assigned during render, which is not safe under concurrent rendering — the
  // ref is seeded with the first `draw` so the initial frame is never stale.
  useEffect(() => {
    drawRef.current = draw;
  }, [draw]);

  const render = useCallback((time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const pixelWidth = Math.round(width * dpr);
    const pixelHeight = Math.round(height * dpr);

    // Assigning width/height also resets the context transform to identity,
    // so the scale below applies exactly once per resize rather than compounding.
    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
    }

    // Absent in jsdom and in any environment without 2D canvas support. A
    // missing context must be a no-op, never a crash.
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    drawRef.current(ctx, { width, height }, time);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let frame = 0;
    let start = 0;
    let onScreen = true;
    let running = false;

    const moving = animate && !reduced;

    const tick = (now: number) => {
      if (!running) return;
      if (!start) start = now;
      render(now - start);
      frame = requestAnimationFrame(tick);
    };

    const startLoop = () => {
      if (running || !moving) return;
      running = true;
      frame = requestAnimationFrame(tick);
    };

    const stopLoop = () => {
      running = false;
      cancelAnimationFrame(frame);
    };

    render(0);

    let observer: IntersectionObserver | undefined;
    if (moving && typeof IntersectionObserver === "function") {
      observer = new IntersectionObserver(
        (entries) => {
          onScreen = entries.some((entry) => entry.isIntersecting);
          if (onScreen) startLoop();
          else stopLoop();
        },
        { rootMargin: "120px" },
      );
      observer.observe(canvas);
    } else if (moving) {
      // No observer available: animate rather than leave the scene frozen.
      startLoop();
    }

    const onResize = () => {
      render(running ? performance.now() - start : 0);
    };
    window.addEventListener("resize", onResize);

    return () => {
      stopLoop();
      observer?.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, [animate, reduced, render]);

  return canvasRef;
}
