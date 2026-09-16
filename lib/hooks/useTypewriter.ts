"use client";

import { useEffect, useState } from "react";

type Options = { speedMs?: number; enabled?: boolean };

export function useTypewriter(text: string, options: Options = {}): string {
  const { speedMs = 28, enabled = true } = options;
  const [shown, setShown] = useState(enabled ? "" : text);

  useEffect(() => {
    if (!enabled) {
      setShown(text);
      return;
    }
    setShown("");
    let index = 0;
    const id = setInterval(() => {
      index += 1;
      setShown(text.slice(0, index));
      if (index >= text.length) clearInterval(id);
    }, speedMs);
    return () => clearInterval(id);
  }, [text, speedMs, enabled]);

  return shown;
}
