import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";
import { useTypewriter } from "@/lib/hooks/useTypewriter";
import { useInView } from "@/lib/hooks/useInView";

function mockMatchMedia(matches: boolean) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("usePrefersReducedMotion", () => {
  it("reports true when the user asks for reduced motion", () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(true);
  });

  it("reports false when the user has no such preference", () => {
    mockMatchMedia(false);
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(false);
  });
});

describe("useTypewriter", () => {
  beforeEach(() => vi.useFakeTimers());

  it("returns the complete string immediately when disabled", () => {
    const { result } = renderHook(() =>
      useTypewriter("system online", { enabled: false }),
    );
    // No timer advance: the full text must already be present, which is what
    // makes reduced-motion and no-JS rendering correct.
    expect(result.current).toBe("system online");
  });

  it("reveals the text one character at a time when enabled", () => {
    const { result } = renderHook(() =>
      useTypewriter("abc", { speedMs: 10, enabled: true }),
    );
    expect(result.current).toBe("");
    act(() => { vi.advanceTimersByTime(10); });
    expect(result.current).toBe("a");
    act(() => { vi.advanceTimersByTime(20); });
    expect(result.current).toBe("abc");
  });

  it("stops at the end rather than looping", () => {
    const { result } = renderHook(() =>
      useTypewriter("ab", { speedMs: 10, enabled: true }),
    );
    act(() => { vi.advanceTimersByTime(500); });
    expect(result.current).toBe("ab");
  });
});

describe("useInView", () => {
  it("reports true immediately when IntersectionObserver is unavailable", () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    const { result } = renderHook(() => useInView<HTMLDivElement>());
    // Degrading to visible is the safe failure: content must never be hidden
    // because an observer is missing.
    expect(result.current.inView).toBe(true);
  });

  it("latches true once and disconnects the observer", () => {
    const disconnect = vi.fn();
    let trigger: ((entries: { isIntersecting: boolean }[]) => void) | undefined;
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        constructor(cb: (entries: { isIntersecting: boolean }[]) => void) {
          trigger = cb;
        }
        observe() {}
        disconnect = disconnect;
      },
    );

    const { result } = renderHook(() => {
      const hook = useInView<HTMLDivElement>();
      // Attach the ref so the effect has an element to observe.
      hook.ref.current = document.createElement("div") as HTMLDivElement;
      return hook;
    });

    act(() => { trigger?.([{ isIntersecting: true }]); });
    expect(result.current.inView).toBe(true);
    expect(disconnect).toHaveBeenCalled();

    act(() => { trigger?.([{ isIntersecting: false }]); });
    expect(result.current.inView).toBe(true);
  });

  it("subscribes exactly once across re-renders", () => {
    const constructed = vi.fn();
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        constructor() {
          constructed();
        }
        observe() {}
        disconnect() {}
      },
    );

    const { rerender } = renderHook(() => {
      const hook = useInView<HTMLDivElement>();
      hook.ref.current = document.createElement("div") as HTMLDivElement;
      return hook;
    });

    rerender();
    rerender();

    // Guards against an options parameter defaulting to a fresh object literal,
    // which would land in the dependency array and re-subscribe every render.
    expect(constructed).toHaveBeenCalledTimes(1);
  });
});
