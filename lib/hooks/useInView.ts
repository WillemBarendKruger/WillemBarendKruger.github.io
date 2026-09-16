"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

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
 */
export function useInView<T extends Element>(): Result<T> {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (typeof IntersectionObserver !== "function") {
      setInView(true);
      return;
    }
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setInView(true);
        observer.disconnect();
      }
    }, OBSERVER_OPTIONS);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return { ref, inView };
}
