"use client";

import { useEffect, useState } from "react";

type Options = { speedMs?: number; enabled?: boolean };

export function useTypewriter(text: string, options: Options = {}): string {
  const { speedMs = 28, enabled = true } = options;
  const key = `${enabled}|${speedMs}|${text}`;
  const [count, setCount] = useState(0);
  const [prevKey, setPrevKey] = useState(key);

  // Documented React pattern: adjusting state during render when an input
  // changes, rather than syncing it in an effect.
  if (key !== prevKey) {
    setPrevKey(key);
    setCount(0);
  }

  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => {
      setCount((n) => {
        if (n >= text.length) {
          clearInterval(id);
          return n;
        }
        return n + 1;
      });
    }, speedMs);
    return () => clearInterval(id);
  }, [key, text.length, speedMs, enabled]);

  return enabled ? text.slice(0, count) : text;
}
