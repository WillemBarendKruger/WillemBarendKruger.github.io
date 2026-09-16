"use client";

import { useCallback, useEffect, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";
import { useTypewriter } from "@/lib/hooks/useTypewriter";

const LINES = [
  "loading developer profile...",
  "loading spellbook...",
  "loading artifacts...",
  "establishing connection...",
  "system status: ONLINE",
];

const STORAGE_KEY = "boot-seen";
const LINE_MS = 260;

/**
 * Renders OVER content that is already in the DOM. It never gates the page:
 * crawlers, no-JS visitors and screen readers all reach the real content
 * regardless of this component.
 */
export function BootOverlay() {
  const reduced = usePrefersReducedMotion();
  const [visible, setVisible] = useState(false);
  const [shown, setShown] = useState(0);
  const heading = useTypewriter("> initializing willem.kruger", {
    speedMs: 22,
    enabled: visible,
  });

  const dismiss = useCallback(() => setVisible(false), []);

  useEffect(() => {
    if (reduced) return;
    try {
      if (sessionStorage.getItem(STORAGE_KEY)) return;
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // Private mode or blocked storage: show it once this page view, which is
      // no worse than showing it once per session.
    }
    // This effect synchronizes with an external system (sessionStorage), so
    // the resulting visibility can't be derived during render — it depends on
    // a one-time read performed here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisible(true);
  }, [reduced]);

  useEffect(() => {
    if (!visible) return;
    const tick = setInterval(() => setShown((n) => n + 1), LINE_MS);
    const done = setTimeout(dismiss, LINE_MS * LINES.length + 500);
    const onKey = () => dismiss();
    window.addEventListener("keydown", onKey);
    return () => {
      clearInterval(tick);
      clearTimeout(done);
      window.removeEventListener("keydown", onKey);
    };
  }, [visible, dismiss]);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      onClick={dismiss}
      className="fixed inset-0 z-40 flex items-center justify-center bg-bg px-4"
    >
      <div className="w-full max-w-md font-mono text-sm">
        <p className="text-green">{heading}</p>
        <ul className="mt-4 space-y-1">
          {LINES.slice(0, shown).map((line) => (
            <li key={line} className="text-muted">
              <span className="text-purple">::</span> {line}
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={dismiss}
          className="mt-8 border border-hairline/50 px-3 py-1 text-xs text-muted hover:border-cyan hover:text-cyan"
        >
          Skip
        </button>
      </div>
    </div>
  );
}
