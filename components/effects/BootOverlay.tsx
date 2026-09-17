"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
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

function readBootSeen(): boolean {
  try {
    return sessionStorage.getItem(STORAGE_KEY) !== null;
  } catch {
    // Private mode or blocked storage: treat as "not seen" so the overlay
    // still shows once for this page view.
    return false;
  }
}

// There is no native storage event for same-tab writes, and the value below
// is read once per mount (and cached for that mount) rather than watched, so
// there is nothing to subscribe to. This no-op is intentional, not an
// oversight.
function subscribeBootSeen(): () => void {
  return () => {};
}

// Server and pre-hydration render assume the overlay has already been seen,
// so it can never appear in static or first-paint HTML. This mirrors
// usePrefersReducedMotion's "assume reduced motion" default.
function getBootSeenServerSnapshot(): boolean {
  return true;
}

function useBootSeen(): boolean {
  // Cached per mount, not per module. Freezing the value for the lifetime of
  // this mount stops the component observing its own sessionStorage write and
  // collapsing mid-animation; resetting it on remount means a client-side
  // navigation back to this page correctly reads "already seen" instead of
  // replaying a frozen answer from a previous visit to this page.
  const seenRef = useRef<boolean | null>(null);

  const getSnapshot = useCallback(() => {
    if (seenRef.current === null) {
      seenRef.current = readBootSeen();
    }
    return seenRef.current;
  }, []);

  return useSyncExternalStore(subscribeBootSeen, getSnapshot, getBootSeenServerSnapshot);
}

/**
 * Renders OVER content that is already in the DOM. It never gates the page:
 * crawlers, no-JS visitors and screen readers all reach the real content
 * regardless of this component.
 */
export function BootOverlay() {
  const reduced = usePrefersReducedMotion();
  const seen = useBootSeen();
  const [dismissed, setDismissed] = useState(false);
  const [shown, setShown] = useState(0);

  // Derived at render, not stored: reduced/seen come from external stores and
  // dismissed is ordinary state set only by event handlers, so nothing here
  // needs a set-state-in-effect.
  const visible = !reduced && !seen && !dismissed;

  const heading = useTypewriter("> initializing willem.kruger", {
    speedMs: 22,
    enabled: visible,
  });

  const dismiss = useCallback(() => setDismissed(true), []);

  // Write-only: record that this session has now seen the overlay, once it
  // actually becomes visible. Sets no React state, so it triggers no
  // re-render of its own.
  useEffect(() => {
    if (!visible) return;
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // Private mode or blocked storage: nothing persists, so the overlay may
      // show again on the next page view. No worse than once per session.
    }
  }, [visible]);

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
