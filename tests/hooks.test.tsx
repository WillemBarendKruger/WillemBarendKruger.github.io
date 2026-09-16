import { act, cleanup, render, renderHook } from "@testing-library/react";
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
  cleanup();
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
  // Renders a real component that attaches the ref via JSX, exactly like
  // production code does — `ref={hook.ref}` on a rendered element, committed
  // by React before effects run. `renderHook` alone can't exercise this: the
  // old version of this suite assigned `hook.ref.current` by hand from
  // *inside* the render callback, before the subscribe effect ever ran. That
  // is not the condition that holds in the real app, and it is exactly the
  // gap that let C1 (the Reveal/Timeline hydration bug) ship: the
  // reduced-motion branch of `Reveal` used to render a *different* element
  // that never attached the ref at all.
  function Probe({ capture }: { capture: (hook: ReturnType<typeof useInView<HTMLDivElement>>) => void }) {
    const hook = useInView<HTMLDivElement>();
    capture(hook);
    return <div ref={hook.ref} />;
  }

  // Mirrors the C1 hydration branch: the hook runs, but the render path it is
  // attached to never produces a DOM node for the ref to find.
  function ProbeWithoutRef({ capture }: { capture: (hook: ReturnType<typeof useInView<HTMLDivElement>>) => void }) {
    const hook = useInView<HTMLDivElement>();
    capture(hook);
    return <div />;
  }

  function latestOf<T>() {
    let latest: T | undefined;
    return {
      capture: (value: T) => {
        latest = value;
      },
      get current() {
        return latest;
      },
    };
  }

  it("reports true immediately when IntersectionObserver is unavailable", () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    const probe = latestOf<ReturnType<typeof useInView<HTMLDivElement>>>();
    render(<Probe capture={probe.capture} />);
    // Degrading to visible is the safe failure: content must never be hidden
    // because an observer is missing.
    expect(probe.current?.inView).toBe(true);
  });

  it("degrades to visible when the ref never attaches to an element (the C1 case)", () => {
    const disconnect = vi.fn();
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        observe() {}
        disconnect = disconnect;
      },
    );

    const probe = latestOf<ReturnType<typeof useInView<HTMLDivElement>>>();
    render(<ProbeWithoutRef capture={probe.capture} />);

    // A null ref.current at subscribe time must latch to visible immediately,
    // the same as the "no IntersectionObserver" fallback — never stuck hidden.
    expect(probe.current?.inView).toBe(true);
    expect(probe.current?.ref.current).toBeNull();
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

    const probe = latestOf<ReturnType<typeof useInView<HTMLDivElement>>>();
    render(<Probe capture={probe.capture} />);

    expect(probe.current?.ref.current).not.toBeNull();

    act(() => { trigger?.([{ isIntersecting: true }]); });
    expect(probe.current?.inView).toBe(true);
    expect(disconnect).toHaveBeenCalled();

    act(() => { trigger?.([{ isIntersecting: false }]); });
    expect(probe.current?.inView).toBe(true);
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

    const probe = latestOf<ReturnType<typeof useInView<HTMLDivElement>>>();
    const { rerender } = render(<Probe capture={probe.capture} />);

    rerender(<Probe capture={probe.capture} />);
    rerender(<Probe capture={probe.capture} />);

    // Guards against an options parameter defaulting to a fresh object literal,
    // which would land in the dependency array and re-subscribe every render.
    expect(constructed).toHaveBeenCalledTimes(1);
  });
});
