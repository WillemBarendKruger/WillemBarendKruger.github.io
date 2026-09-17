"use client";

import { useCallback, useRef, useSyncExternalStore, type RefObject } from "react";

type Result<T extends Element> = { ref: RefObject<T | null>; inView: boolean };

const OBSERVER_OPTIONS: IntersectionObserverInit = {
  threshold: 0.15,
  rootMargin: "0px 0px -8% 0px",
};

/**
 * Fires once and latches. Scroll reveals are enter-only — re-hiding content on
 * scroll-out is disorienting and breaks find-in-page.
 *
 * Deliberately takes no arguments. An options parameter defaulting to `{}`
 * would be a new object identity on every render, so an effect depending on it
 * would tear down and re-subscribe the observer continuously.
 *
 * Uses useSyncExternalStore rather than useState+useEffect because the
 * "IntersectionObserver unavailable" fallback reads a browser global.
 * Evaluating that inside a useState initializer would run on both server and
 * client with different results (undefined during SSR vs. defined in a real
 * browser), which is a hydration mismatch. useSyncExternalStore pins the
 * server/first-hydration snapshot to a single agreed value instead.
 */
export function useInView<T extends Element>(): Result<T> {
  const ref = useRef<T | null>(null);
  const latched = useRef(false);

  // Stable identity, so useSyncExternalStore subscribes exactly once and
  // never tears down/re-subscribes across re-renders.
  const subscribe = useCallback((onStoreChange: () => void) => {
    // No observer available: degrade to visible rather than leaving content
    // hidden forever.
    if (typeof IntersectionObserver !== "function") {
      latched.current = true;
      onStoreChange();
      return () => {};
    }
    const element = ref.current;
    // No element to observe (e.g. the ref hasn't attached, or attached to a
    // branch that never renders a DOM node): degrade to visible rather than
    // leaving content stuck hidden forever, same as the no-IntersectionObserver
    // path above.
    if (!element) {
      latched.current = true;
      onStoreChange();
      return () => {};
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        latched.current = true;
        onStoreChange();
        observer.disconnect();
      }
    }, OBSERVER_OPTIONS);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const inView = useSyncExternalStore(
    subscribe,
    () => latched.current,
    // Server and first hydration render always agree on false. Nothing is
    // hidden by this: the reduced-motion/no-JS page this backs is already
    // fully static and visible without inView ever needing to be true there.
    () => false,
  );

  return { ref, inView };
}
