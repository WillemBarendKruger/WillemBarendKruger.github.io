# Portfolio Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the HTML5 UP static site at `WillemBarendKruger.github.io` with a Next.js + TypeScript portfolio, statically exported and deployed to GitHub Pages via GitHub Actions.

**Architecture:** Next.js App Router with Server Components by default; exactly four client components (`BootOverlay`, `ParticleField`, `Reveal`, `SpellbookGrid`). All content lives in typed data modules under `data/`, validated at build time so malformed data fails the build rather than shipping. Design tokens are CSS custom properties consumed by Tailwind v4's `@theme`. Animation uses three hand-rolled hooks — no animation library.

**Tech Stack:** Next.js (16.x), React 19, TypeScript, Tailwind CSS v4, Vitest + Testing Library + jsdom, Playwright + axe-core, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-09-16-portfolio-rebuild-design.md` — read it before starting. Section 9 (verified content inventory) is binding: it is the *only* permitted source of factual claims.

## Global Constraints

- **Branch:** all work on `feat/portfolio-rebuild`. Never commit to `main`.
- **No invented facts.** Every factual claim on the site must appear in spec §9. If content is needed that §9 does not cover, stop and ask — do not write plausible filler.
- **No client content.** Nothing derived from `DEP and Field-service` (DEP, RSL CRM, pd-chat) may enter this repository. Employment is described as "Boxfusion" + "Shesha" only.
- **No numeric skill ratings.** No percentages, no 1–10 scores, no progress bars implying measured proficiency.
- **No animation library.** Do not install Framer Motion, GSAP, react-spring, or equivalents.
- **No runtime GitHub API.** Repository data is static.
- **Colour literals only in `app/globals.css`.** Every other file references tokens.
- **Muted text token is `#8B949E`.** `#6E7681` is `--color-hairline`, for non-text use only.
- **`prefers-reduced-motion: reduce` must yield a complete, static, fully usable page.**
- **Node:** v20.17.0 is installed locally. CI uses Node 20.
- **Commit trailer:** end every commit message with `Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>`

---

## File Structure

| Path | Responsibility |
|---|---|
| `next.config.ts` | Static export configuration |
| `app/globals.css` | Design tokens (`@theme`), base styles, global reduced-motion kill-switch |
| `app/layout.tsx` | Fonts, metadata, skip-link, `<main>` landmark |
| `app/page.tsx` | Homepage — composes section components in narrative order |
| `app/projects/[slug]/page.tsx` | Case-study route, `generateStaticParams` |
| `app/not-found.tsx` | 404 |
| `data/types.ts` | All content types |
| `data/validate.ts` | Build-time data integrity assertions |
| `data/{profile,skills,projects,timeline,quests}.ts` | Content, one concern each |
| `lib/hooks/usePrefersReducedMotion.ts` | Single source of motion preference |
| `lib/hooks/useInView.ts` | Fire-once intersection detection |
| `lib/hooks/useTypewriter.ts` | Terminal typing effect |
| `components/ui/*` | `Panel`, `TerminalFrame`, `Tag`, `GlowButton`, `SectionHeading`, `Reveal` |
| `components/effects/*` | `BootOverlay`, `ParticleField` |
| `components/sections/*` | `Hero`, `Identity`, `Spellbook`, `FeaturedProjects`, `Timeline`, `QuestLog`, `Connect` |
| `scripts/` | none — checks live in tests |
| `.github/workflows/deploy.yml` | Build, test, deploy to Pages |

---

## Task 1: Archive the old site and scaffold the Next.js app

**Files:**
- Delete: `index.html`, `Projects-page.html`, `education-page.html`, `README.txt`, `LICENSE.txt`, `assets/css/`, `assets/js/`, `assets/sass/`, `assets/webfonts/`
- Create: `package.json`, `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `.gitignore`
- Move: `images/*` → `public/images/`, CV PDF → `public/cv/`

**Interfaces:**
- Consumes: nothing
- Produces: a buildable Next.js app whose `npm run build` emits `out/index.html`

- [ ] **Step 1: Tag the old site before deleting anything**

`4be6142` is the tip of `main` and therefore the site as currently deployed.

```bash
git tag v1-html5up 4be6142
git push origin v1-html5up
```

Verify the tag exists on the remote before continuing:

```bash
git ls-remote --tags origin v1-html5up
```

Expected: one line containing `refs/tags/v1-html5up`. **If this is empty, stop.** The old site is the only copy.

- [ ] **Step 2: Move the assets worth keeping**

```bash
mkdir -p public/images public/cv
git mv "images/Profile pic-transperent.png" public/images/profile.png
git mv images/Employee-management.png public/images/employee-management.png
git mv images/WebApp.png public/images/sen371-web-app.png
git mv images/Neural-Instant-Search-social.gif public/images/wpr371-song-search.gif
git mv "assets/Willem Barend Kruger_CV_2025(JavaScript developer).pdf" "public/cv/willem-kruger-cv-2025.pdf"
```

- [ ] **Step 3: Delete the old site**

```bash
git rm -r --quiet index.html Projects-page.html education-page.html README.txt LICENSE.txt assets images
```

Verify nothing intended to survive was removed:

```bash
ls public/images public/cv
```

Expected: `profile.png`, `employee-management.png`, `sen371-web-app.png`, `wpr371-song-search.gif`, and `willem-kruger-cv-2025.pdf`.

- [ ] **Step 4: Scaffold Next.js into a temporary directory**

`create-next-app` refuses a non-empty directory, so scaffold beside the repo and copy in.

```bash
cd ..
npx --yes create-next-app@latest portfolio-scaffold \
  --typescript --tailwind --eslint --app --no-src-dir \
  --import-alias "@/*" --use-npm --yes
```

These flags target a Next.js version published after this plan was written. **If any flag is
rejected, run `npx create-next-app@latest --help`, use the equivalent documented flag, and note
the correction in your report.** The requirements that matter are: TypeScript, Tailwind, ESLint,
App Router, no `src/` directory, `@/*` import alias, npm. How the CLI spells them is its business.

- [ ] **Step 5: Copy the scaffold into the repo**

```bash
cd portfolio-scaffold
cp -r package.json tsconfig.json next.config.ts postcss.config.mjs eslint.config.mjs app ../WillemBarendKruger.github.io/
cp .gitignore ../WillemBarendKruger.github.io/.gitignore
cd ../WillemBarendKruger.github.io
rm -rf ../portfolio-scaffold
npm install
```

- [ ] **Step 6: Record the resolved versions**

```bash
node -e "const p=require('./package.json');console.log(JSON.stringify({...p.dependencies,...p.devDependencies},null,2))"
```

Paste the output into the PR description. The spec deliberately does not pin versions; this is how the actual set gets recorded.

- [ ] **Step 7: Configure static export**

Replace `next.config.ts` entirely:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // GitHub Pages serves static files only — no Node server available.
  output: "export",
  // The image optimiser requires a server; static export must opt out.
  images: { unoptimized: true },
  // Emits `about/index.html` rather than `about.html`, which Pages resolves correctly.
  trailingSlash: true,
};

export default nextConfig;
```

- [ ] **Step 8: Add the Jekyll guard**

```bash
touch public/.nojekyll
```

GitHub Pages historically strips underscore-prefixed directories; Next.js emits `_next/`.

- [ ] **Step 9: Ignore build output**

Append to `.gitignore`:

```gitignore
# Next.js static export output
/out/
```

- [ ] **Step 10: Build and verify the export**

```bash
npm run build
ls out/index.html out/_next
```

Expected: both paths exist. If `out/` is absent, `output: "export"` did not apply — fix before continuing.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js app, archive HTML5 UP site

Old site preserved at tag v1-html5up. Configures static export for
GitHub Pages: no server, unoptimised images, trailing slashes.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: Design tokens with an enforced contrast floor

**Files:**
- Modify: `app/globals.css`
- Create: `lib/color.ts`, `tests/color.test.ts`, `tests/tokens.test.ts`
- Create: `vitest.config.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `contrastRatio(hexA: string, hexB: string): number`, `relativeLuminance(hex: string): number`, and the CSS token names `--color-{bg,panel,green,cyan,purple,text,muted,hairline}`

- [ ] **Step 1: Install the test toolchain**

```bash
npm install --save-dev vitest @vitejs/plugin-react @testing-library/react @testing-library/dom jsdom
```

- [ ] **Step 2: Configure Vitest**

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./", import.meta.url)) },
  },
  test: {
    environment: "jsdom",
    globals: true,
    include: ["tests/**/*.test.{ts,tsx}"],
  },
});
```

Add to `package.json` scripts:

```json
"test": "vitest run",
"test:watch": "vitest",
"typecheck": "tsc --noEmit"
```

- [ ] **Step 3: Write the failing contrast-maths test**

Create `tests/color.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { contrastRatio, relativeLuminance } from "@/lib/color";

describe("relativeLuminance", () => {
  it("returns 0 for black and 1 for white", () => {
    expect(relativeLuminance("#000000")).toBeCloseTo(0, 5);
    expect(relativeLuminance("#FFFFFF")).toBeCloseTo(1, 5);
  });

  it("accepts hex with or without a leading hash, any case", () => {
    expect(relativeLuminance("fff")).toBeCloseTo(1, 5);
    expect(relativeLuminance("#ffffff")).toBeCloseTo(1, 5);
  });

  it("rejects malformed hex rather than guessing", () => {
    expect(() => relativeLuminance("#12345")).toThrow(/invalid hex/i);
  });
});

describe("contrastRatio", () => {
  it("returns 21 for black on white", () => {
    expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21, 2);
  });

  it("returns 1 for a colour against itself", () => {
    expect(contrastRatio("#39FF88", "#39FF88")).toBeCloseTo(1, 5);
  });

  it("is order-independent", () => {
    expect(contrastRatio("#05070A", "#C9D1D9")).toBeCloseTo(
      contrastRatio("#C9D1D9", "#05070A"),
      5,
    );
  });
});
```

- [ ] **Step 4: Run it and watch it fail**

Run: `npm test -- tests/color.test.ts`
Expected: FAIL — cannot resolve `@/lib/color`.

- [ ] **Step 5: Implement the colour maths**

Create `lib/color.ts`:

```ts
/** WCAG 2.1 relative luminance and contrast, used to enforce the palette's AA floor. */

const HEX = /^#?(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

function toChannels(hex: string): [number, number, number] {
  if (!HEX.test(hex)) throw new Error(`invalid hex colour: ${hex}`);
  let body = hex.replace("#", "");
  if (body.length === 3) body = body.split("").map((c) => c + c).join("");
  return [
    parseInt(body.slice(0, 2), 16),
    parseInt(body.slice(2, 4), 16),
    parseInt(body.slice(4, 6), 16),
  ];
}

/** Linearises an 8-bit sRGB channel per WCAG 2.1. */
function linearise(value: number): number {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

export function relativeLuminance(hex: string): number {
  const [r, g, b] = toChannels(hex).map(linearise);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [light, dark] = la > lb ? [la, lb] : [lb, la];
  return (light + 0.05) / (dark + 0.05);
}
```

- [ ] **Step 6: Run and verify green**

Run: `npm test -- tests/color.test.ts`
Expected: PASS, 6 tests.

- [ ] **Step 7: Write the failing token-contrast test**

This test is the actual guard: it reads the real stylesheet, so a future palette edit that breaks AA fails CI.

Create `tests/tokens.test.ts`:

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { contrastRatio } from "@/lib/color";

const css = readFileSync("app/globals.css", "utf8");

function token(name: string): string {
  const match = css.match(new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{3,6})`));
  if (!match) throw new Error(`token --color-${name} not found in globals.css`);
  return match[1];
}

describe("design tokens", () => {
  it("defines every token the design system requires", () => {
    for (const name of ["bg", "panel", "green", "cyan", "purple", "text", "muted", "hairline"]) {
      expect(() => token(name)).not.toThrow();
    }
  });

  // WCAG AA: 4.5:1 for normal text.
  it.each([
    ["text", "bg"],
    ["text", "panel"],
    ["muted", "bg"],
    ["muted", "panel"],
    ["cyan", "bg"],
    ["green", "bg"],
    ["purple", "bg"],
    ["purple", "panel"],
  ])("%s on %s meets AA for body text", (fg, bg) => {
    expect(contrastRatio(token(fg), token(bg))).toBeGreaterThanOrEqual(4.5);
  });

  it("keeps hairline out of text duty by documenting it fails AA", () => {
    // Guards intent: if someone lightens hairline enough to pass, they should
    // promote it to a text token deliberately rather than by accident.
    expect(contrastRatio(token("hairline"), token("bg"))).toBeLessThan(4.5);
  });
});
```

- [ ] **Step 8: Run it and watch it fail**

Run: `npm test -- tests/tokens.test.ts`
Expected: FAIL — tokens not found in `globals.css`.

- [ ] **Step 9: Write the tokens and base styles**

Replace `app/globals.css` entirely:

```css
@import "tailwindcss";

@theme {
  --color-bg: #05070A;
  --color-panel: #0D1117;
  --color-green: #39FF88;
  --color-cyan: #00E5FF;
  --color-purple: #9B5CFF;
  --color-text: #C9D1D9;
  --color-muted: #8B949E;
  --color-hairline: #6E7681;

  --font-mono: var(--font-jetbrains-mono), ui-monospace, monospace;
  --font-sans: var(--font-inter), ui-sans-serif, system-ui, sans-serif;

  --shadow-glow-sm: 0 0 8px -2px currentColor;
  --shadow-glow-md: 0 0 18px -4px currentColor;
  --shadow-glow-lg: 0 0 36px -8px currentColor;
}

@layer base {
  html {
    scroll-behavior: smooth;
  }

  body {
    background-color: var(--color-bg);
    color: var(--color-text);
    font-family: var(--font-sans);
    -webkit-font-smoothing: antialiased;
  }

  :focus-visible {
    outline: 2px solid var(--color-cyan);
    outline-offset: 2px;
  }

  ::selection {
    background-color: var(--color-purple);
    color: #ffffff;
  }
}

/*
 * Global motion kill-switch. Components additionally check the preference in
 * JS (see lib/hooks/usePrefersReducedMotion) so effects never mount at all —
 * this rule is the backstop for anything purely CSS-driven.
 */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

- [ ] **Step 10: Run and verify green**

Run: `npm test`
Expected: PASS, all tests across both files.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "feat: add design tokens with enforced WCAG AA contrast floor

Tokens live in globals.css as the single source of truth. tests/tokens.test.ts
reads the real stylesheet and fails the build if any text pair drops below
4.5:1 — the brief's suggested muted colour (#6E7681) did, so it is demoted to
a non-text hairline token and muted text is #8B949E.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: Motion primitives

**Files:**
- Create: `lib/hooks/usePrefersReducedMotion.ts`, `lib/hooks/useInView.ts`, `lib/hooks/useTypewriter.ts`
- Create: `tests/hooks.test.tsx`

**Interfaces:**
- Consumes: nothing
- Produces:
  - `usePrefersReducedMotion(): boolean` — defaults to `true` before hydration
  - `useInView<T extends Element>(): { ref: RefObject<T | null>; inView: boolean }` — latches true, never returns to false. **Takes no arguments.** An options parameter defaulting to `{}` would be a fresh object on every render, re-subscribing the observer each time; no caller needs custom options.
  - `useTypewriter(text: string, opts?: { speedMs?: number; enabled?: boolean }): string`

- [ ] **Step 1: Write the failing hook tests**

Create `tests/hooks.test.tsx`:

```tsx
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
```

- [ ] **Step 2: Run and watch it fail**

Run: `npm test -- tests/hooks.test.tsx`
Expected: FAIL — none of the three modules resolve.

- [ ] **Step 3: Implement `usePrefersReducedMotion`**

Create `lib/hooks/usePrefersReducedMotion.ts`:

```ts
"use client";

import { useEffect, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Defaults to `true` so the first render — server, pre-hydration, or in an
 * environment without matchMedia — is the static, complete version. Motion is
 * then opted into once we know the user permits it, never opted out of.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(true);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const mq = window.matchMedia(QUERY);
    setReduced(mq.matches);
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}
```

- [ ] **Step 4: Implement `useTypewriter`**

Create `lib/hooks/useTypewriter.ts`:

```ts
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
```

- [ ] **Step 5: Implement `useInView`**

Create `lib/hooks/useInView.ts`:

```ts
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
```

- [ ] **Step 6: Run and verify green**

Run: `npm test`
Expected: PASS, all suites.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add motion primitives with safe-by-default fallbacks

Three hooks replace an animation library. Each degrades toward the static,
visible state: reduced motion is assumed until proven otherwise, useInView
reports visible when IntersectionObserver is missing, and useTypewriter
returns the full string when disabled.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: Typed data layer and build-time validation

**Files:**
- Create: `data/types.ts`, `data/validate.ts`, `tests/validate.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces: types `Project`, `CaseStudy`, `SkillGroup`, `TimelineEntry`, `Quest`, `Profile`; and `validateProjects(projects: readonly Project[]): void` which throws on any violation

- [ ] **Step 1: Write the failing validator tests**

Create `tests/validate.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { validateProjects } from "@/data/validate";
import type { Project } from "@/data/types";

function project(overrides: Partial<Project> = {}): Project {
  return {
    slug: "example-project",
    name: "Example Project",
    tagline: "An example.",
    featured: false,
    status: "archived",
    collaboration: "solo",
    technologies: ["TypeScript"],
    links: { source: "https://github.com/example/example" },
    ...overrides,
  };
}

describe("validateProjects", () => {
  it("accepts a well-formed set", () => {
    expect(() => validateProjects([project()])).not.toThrow();
  });

  it("rejects duplicate slugs, which would collide as routes", () => {
    expect(() => validateProjects([project(), project()])).toThrow(/duplicate slug/i);
  });

  it("rejects a slug that is not URL-safe kebab-case", () => {
    expect(() => validateProjects([project({ slug: "Not A Slug" })])).toThrow(/slug/i);
  });

  it("rejects a malformed link", () => {
    expect(() =>
      validateProjects([project({ links: { source: "github.com/no-scheme" } })]),
    ).toThrow(/url/i);
  });

  it("rejects a project with no technologies listed", () => {
    expect(() => validateProjects([project({ technologies: [] })])).toThrow(/technolog/i);
  });

  it("rejects a featured project with no case study", () => {
    expect(() => validateProjects([project({ featured: true })])).toThrow(/case study/i);
  });

  it("rejects a featured project whose case study is incomplete", () => {
    expect(() =>
      validateProjects([
        project({
          featured: true,
          caseStudy: {
            problem: "",
            architecture: [{ layer: "Backend", detail: ".NET" }],
            features: ["Something"],
            planned: [],
            learned: "Something.",
          },
        }),
      ]),
    ).toThrow(/problem/i);
  });

  it("accepts a complete featured project", () => {
    expect(() =>
      validateProjects([
        project({
          featured: true,
          caseStudy: {
            problem: "A real problem statement.",
            architecture: [{ layer: "Backend", detail: ".NET 8" }],
            features: ["Equipment tracking"],
            planned: ["Automated tests in CI"],
            learned: "A real lesson.",
          },
        }),
      ]),
    ).not.toThrow();
  });
});
```

- [ ] **Step 2: Run and watch it fail**

Run: `npm test -- tests/validate.test.ts`
Expected: FAIL — `@/data/validate` does not resolve.

- [ ] **Step 3: Define the types**

Create `data/types.ts`:

```ts
export type ArchitectureLayer = { layer: string; detail: string };

export type CaseStudy = {
  problem: string;
  architecture: readonly ArchitectureLayer[];
  features: readonly string[];
  /** Explicitly NOT built. Kept separate so the UI can never present it as shipped. */
  planned: readonly string[];
  learned: string;
};

export type Project = {
  slug: string;
  name: string;
  tagline: string;
  featured: boolean;
  status: "live" | "in-progress" | "archived";
  collaboration: "solo" | "team";
  technologies: readonly string[];
  links: { source?: string; live?: string };
  image?: string;
  /** Shown verbatim when the repository is not under Willem's account. */
  attribution?: string;
  caseStudy?: CaseStudy;
};

export type SkillGroup = {
  id: string;
  title: string;
  blurb: string;
  /** Names only. Numeric proficiency ratings are forbidden by the spec. */
  skills: readonly string[];
};

export type TimelineEntry = {
  period: string;
  title: string;
  org?: string;
  detail: string;
};

export type Quest = {
  title: string;
  detail: string;
  status: "active" | "planned";
};

export type Profile = {
  name: string;
  handle: string;
  role: string;
  epithet: string;
  location: string;
  summary: readonly string[];
  email: string;
  links: readonly { label: string; href: string }[];
};
```

- [ ] **Step 4: Implement the validator**

Create `data/validate.ts`:

```ts
import type { Project } from "./types";

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function assertUrl(value: string, context: string): void {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`${context}: not a valid absolute URL: ${value}`);
  }
  if (parsed.protocol !== "https:") {
    throw new Error(`${context}: URL must use https: ${value}`);
  }
}

function assertNonEmpty(value: string, context: string): void {
  if (value.trim().length === 0) throw new Error(`${context}: must not be empty`);
}

/**
 * Imported by the data modules themselves, so bad content fails `next build`
 * rather than shipping a broken card to production.
 */
export function validateProjects(projects: readonly Project[]): void {
  const seen = new Set<string>();

  for (const project of projects) {
    const where = `project "${project.slug}"`;

    if (!SLUG.test(project.slug)) {
      throw new Error(`${where}: slug must be lowercase kebab-case`);
    }
    if (seen.has(project.slug)) {
      throw new Error(`duplicate slug: ${project.slug}`);
    }
    seen.add(project.slug);

    assertNonEmpty(project.name, `${where}: name`);
    assertNonEmpty(project.tagline, `${where}: tagline`);

    if (project.technologies.length === 0) {
      throw new Error(`${where}: must list at least one technology`);
    }

    for (const [key, url] of Object.entries(project.links)) {
      if (url) assertUrl(url, `${where}: links.${key}`);
    }

    if (!project.featured) continue;

    const study = project.caseStudy;
    if (!study) {
      throw new Error(`${where}: featured projects require a case study`);
    }
    assertNonEmpty(study.problem, `${where}: caseStudy.problem`);
    assertNonEmpty(study.learned, `${where}: caseStudy.learned`);
    if (study.architecture.length === 0) {
      throw new Error(`${where}: caseStudy.architecture must not be empty`);
    }
    if (study.features.length === 0) {
      throw new Error(`${where}: caseStudy.features must not be empty`);
    }
  }
}
```

- [ ] **Step 5: Run and verify green**

Run: `npm test -- tests/validate.test.ts`
Expected: PASS, 8 tests.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add content types and build-time data validation

Separates caseStudy.features (built, verified in source) from
caseStudy.planned (explicitly not built) at the type level, so the UI
cannot present unbuilt work as shipped.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: Content

Every value below comes from spec §9. Do not add, embellish, or infer beyond it.

**Files:**
- Create: `data/profile.ts`, `data/skills.ts`, `data/projects.ts`, `data/timeline.ts`, `data/quests.ts`

**Interfaces:**
- Consumes: `@/data/types`, `validateProjects`
- Produces: `profile`, `skillGroups`, `projects`, `featuredProjects`, `getProject(slug)`, `timeline`, `quests`

- [ ] **Step 1: Write the profile**

Create `data/profile.ts`:

```ts
import type { Profile } from "./types";

export const profile: Profile = {
  name: "Willem Kruger",
  handle: "WillemBarendKruger",
  role: "Software Engineer",
  epithet: "Digital Arcanist",
  location: "Mpumalanga, South Africa",
  summary: [
    "I build backend systems and the interfaces that sit on top of them — mostly C# and .NET on the server, TypeScript and React in the browser.",
    "Day to day I work on enterprise applications built with Shesha, an open-source .NET and Next.js framework. That means domain modelling, API design, and the kind of authorisation and workflow problems that only show up once software has real users.",
    "I am currently deepening my Azure knowledge, working toward the AZ-204 certification, and getting better at testing the code I write.",
  ],
  email: "willem.kruger11@gmail.com",
  links: [
    { label: "GitHub", href: "https://github.com/WillemBarendKruger" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/willem-kruger-72878a282" },
  ],
};
```

- [ ] **Step 2: Write the skill groups**

Create `data/skills.ts`:

```ts
import type { SkillGroup } from "./types";

export const skillGroups: readonly SkillGroup[] = [
  {
    id: "primary-arcana",
    title: "Primary Arcana",
    blurb: "Backend work — where most of my time goes.",
    skills: ["C#", ".NET 8", "ASP.NET Core", "ABP Framework", "REST APIs", "Entity Framework", "PostgreSQL", "SQL Server"],
  },
  {
    id: "web-arcana",
    title: "Web Arcana",
    blurb: "The interfaces those systems are used through.",
    skills: ["TypeScript", "React", "Next.js", "JavaScript", "Ant Design", "HTML", "CSS"],
  },
  {
    id: "cloud-arcana",
    title: "Cloud Arcana",
    blurb: "Shipping and running what gets built. Actively growing.",
    skills: ["Azure", "GitHub Actions", "Docker", "Vercel"],
  },
  {
    id: "arsenal",
    title: "Developer Arsenal",
    blurb: "Daily tools.",
    skills: ["Git", "GitHub", "VS Code", "Visual Studio", "Postman", "Bash"],
  },
] as const;
```

- [ ] **Step 3: Write the projects**

Create `data/projects.ts`:

```ts
import type { Project } from "./types";
import { validateProjects } from "./validate";

export const projects: readonly Project[] = [
  {
    slug: "apex-it",
    name: "Apex IT",
    tagline: "Office equipment management for organisations — cataloguing, condition reporting and AI-assisted troubleshooting.",
    featured: true,
    status: "in-progress",
    collaboration: "solo",
    technologies: ["C#", ".NET 8", "ABP Framework", "Next.js", "TypeScript", "Ant Design", "PostgreSQL", "Docker", "GitHub Actions"],
    links: { source: "https://github.com/WillemBarendKruger/Apex-IT" },
    caseStudy: {
      problem:
        "Organisations lose track of their equipment. Who has which laptop, what condition it is in, and what happened the last time it broke are usually spread across spreadsheets and memory. I wanted to build the full path — from cataloguing an asset to reporting a fault to getting a useful answer back.",
      architecture: [
        { layer: "Frontend", detail: "Next.js 15 with TypeScript and Ant Design" },
        { layer: "Backend", detail: "ASP.NET Boilerplate (ABP v9) on .NET 8" },
        { layer: "Database", detail: "PostgreSQL" },
        { layer: "Authentication", detail: "JWT, with role-based access separating supervisors from employees" },
        { layer: "External services", detail: "SendGrid for transactional email; Google Gemini for image and text analysis" },
        { layer: "Delivery", detail: "Docker images for backend and frontend; GitHub Actions builds both on every push and pull request" },
      ],
      features: [
        "Catalogue and categorise equipment — PCs, printers, projectors",
        "Track status, usage and location",
        "Submit and track condition reports",
        "Role-based access for supervisors and employees",
        "JWT authentication",
        "Email notifications via SendGrid",
        "AI troubleshooting chatbot accepting both images and text, backed by Google Gemini",
        "Image upload for fault reporting",
      ],
      planned: [
        "Automated tests running in CI — the workflow builds, but the test step is not yet enabled",
        "A deployment step — CI stops at build; there is no CD yet",
        "Moving the Gemini API key behind a backend route instead of the client bundle",
      ],
      learned:
        "Most of what I learned was about boundaries. ABP gives you a lot of structure, and the work is deciding what belongs in the domain layer versus the application layer rather than writing plumbing. The AI feature taught me a harder lesson: calling Gemini from the client was the fastest way to make it work and the wrong way to ship it, because it puts the API key in the browser bundle. Knowing why that is wrong is worth more than the feature.",
    },
  },
  {
    slug: "potholio",
    name: "Potholio",
    tagline: "Full-stack pothole reporting and municipality management, built with a team.",
    featured: true,
    status: "archived",
    collaboration: "team",
    technologies: ["C#", ".NET", "Next.js", "TypeScript", "Docker"],
    links: { source: "https://github.com/Anroux11/Potholio" },
    attribution: "Team project. 48 of 207 commits are mine, across 126 merged pull requests. The repository is hosted on a teammate's account.",
    caseStudy: {
      problem:
        "Reporting a pothole to a municipality usually means it disappears into an inbox. The team built a system where a report becomes a tracked incident with a state, an owner and a history.",
      architecture: [
        { layer: "Frontend", detail: "Next.js with TypeScript" },
        { layer: "Backend", detail: ".NET, split into Application, Core and Web.Host projects" },
        { layer: "Delivery", detail: "Docker Compose for local orchestration" },
      ],
      features: [
        "User registration and authentication",
        "Incident reporting and tracking",
        "Municipality management",
      ],
      planned: [],
      learned:
        "This was the first codebase I worked in where my changes could break someone else's. Two hundred commits and a hundred and twenty-six pull requests later, the parts that mattered were the boring ones: keeping branches small enough to review, writing a description someone else could act on, and resolving conflicts without flattening a teammate's work.",
    },
  },
  {
    slug: "fitfusion",
    name: "FitFusion",
    tagline: "A platform where personal trainers manage clients, meal plans and nutrition.",
    featured: false,
    status: "archived",
    collaboration: "solo",
    technologies: ["Next.js", "TypeScript", "React"],
    links: { source: "https://github.com/WillemBarendKruger/graduate-frontend-project-personal-trainer-platform" },
  },
  {
    slug: "developer-dashboard",
    name: "React Developer Dashboard",
    tagline: "Search, browse and favourite GitHub developers. Built to a Figma design.",
    featured: false,
    status: "archived",
    collaboration: "solo",
    technologies: ["React", "TypeScript", "Vite", "GitHub API"],
    links: { source: "https://github.com/WillemBarendKruger/React-Developer-Dashboard" },
  },
  {
    slug: "it-asset-management",
    name: "IT Asset Management",
    tagline: "Asset tracking on Shesha — domain modelling and specification-based filtering.",
    featured: false,
    status: "archived",
    collaboration: "solo",
    technologies: ["C#", ".NET", "Shesha", "Next.js", "PostgreSQL"],
    links: { source: "https://github.com/WillemBarendKruger/itassetmanagent" },
  },
  {
    slug: "ride-along",
    name: "Ride-Along",
    tagline: "A C# ride-sharing simulation exercising interfaces, abstract classes and a rating service.",
    featured: false,
    status: "archived",
    collaboration: "solo",
    technologies: ["C#", ".NET"],
    links: { source: "https://github.com/WillemBarendKruger/Ride-Along-Ride-Sharing-System" },
  },
  {
    slug: "song-searcher",
    name: "NodeJS Song Searcher",
    tagline: "A terminal application that searches for songs by name. University coursework, 2022.",
    featured: false,
    status: "archived",
    collaboration: "solo",
    technologies: ["JavaScript", "Node.js"],
    links: { source: "https://github.com/WillemBarendKruger/WPR371_Assignment1" },
    image: "/images/wpr371-song-search.gif",
  },
  {
    slug: "employee-management",
    name: "Employee Management System",
    tagline: "A C# Windows application for creating, editing and deleting employee records. University coursework.",
    featured: false,
    status: "archived",
    collaboration: "solo",
    technologies: ["C#", ".NET"],
    links: { source: "https://github.com/WillemBarendKruger/Employee-management-system-Project" },
    image: "/images/employee-management.png",
  },
  {
    slug: "sen371-service-platform",
    name: "SEN371 Service Platform",
    tagline: "A multi-service web application with separate client and technician experiences. University team project.",
    featured: false,
    status: "archived",
    collaboration: "team",
    technologies: ["JavaScript", "HTML", "CSS"],
    links: { source: "https://github.com/HenryG-code/SEN371-project" },
    attribution: "University team project. The repository is hosted on a teammate's account.",
    image: "/images/sen371-web-app.png",
  },
] as const;

// Runs at import time, so `next build` fails on malformed content.
validateProjects(projects);

export const featuredProjects = projects.filter((project) => project.featured);

export function getProject(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}
```

- [ ] **Step 4: Write the timeline**

Create `data/timeline.ts`:

```ts
import type { TimelineEntry } from "./types";

export const timeline: readonly TimelineEntry[] = [
  {
    period: "2021 – 2024",
    title: "Bachelor of Information Technology",
    org: "Belgium Campus ITversity",
    detail:
      "Object-oriented programming, data structures, software engineering, web development, software analysis and design, software testing, database development, data analytics and business intelligence.",
  },
  {
    period: "2022 – 2024",
    title: "Coursework and first projects",
    detail:
      "C# desktop applications, Node.js command-line tools, and a team-built multi-service web application. The milestone project was an aviation safety weather observation system — reading temperature, humidity and light from onboard sensors, warning pilots of hazardous conditions, and transmitting readings to a web page over an ESP32.",
  },
  {
    period: "May 2025 – present",
    title: "Graduate Software Engineer",
    org: "Boxfusion",
    detail:
      "Enterprise applications built on Shesha, Boxfusion's open-source .NET and Next.js framework. Domain modelling, application services, and the authorisation and workflow problems that come with systems in real use.",
  },
  {
    period: "2025 – present",
    title: "Backend and cloud focus",
    detail:
      "Deliberately moving deeper into .NET, enterprise architecture and Azure, while building personal projects that exercise the same ideas end to end.",
  },
] as const;
```

- [ ] **Step 5: Write the quests**

Create `data/quests.ts`:

```ts
import type { Quest } from "./types";

/** Edit this file alone to update the Active Quests section. */
export const quests: readonly Quest[] = [
  {
    title: "Azure",
    detail: "Cloud architecture, Azure services and deployment models.",
    status: "active",
  },
  {
    title: "AZ-204",
    detail: "Preparing for the Azure Developer Associate certification.",
    status: "active",
  },
  {
    title: "Testing",
    detail: "C# unit testing and backend design that stays maintainable under change.",
    status: "active",
  },
  {
    title: "AI engineering",
    detail: "Practical AI integration into applications and developer workflows.",
    status: "active",
  },
] as const;
```

- [ ] **Step 6: Verify the content typechecks**

Run: `npm run typecheck`
Expected: no type errors.

`validateProjects` runs for real from Task 7 onward, when `next build` first imports these
modules. If it throws then, the message names the offending project and field.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add site content from the verified inventory

Every claim traces to spec section 9. Apex-IT's unbuilt work (CI test step,
deployment, server-side Gemini key) is recorded under caseStudy.planned
rather than presented as shipped.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: UI primitives

**Files:**
- Create: `components/ui/Panel.tsx`, `TerminalFrame.tsx`, `Tag.tsx`, `GlowButton.tsx`, `SectionHeading.tsx`, `Reveal.tsx`

**Interfaces:**
- Consumes: `useInView`, `usePrefersReducedMotion`
- Produces:
  - `<Panel accent?: "green" | "cyan" | "purple">`
  - `<TerminalFrame title: string>`
  - `<Tag>{string}</Tag>`
  - `<GlowButton href: string; variant?: "primary" | "ghost">`
  - `<SectionHeading id: string; index: string; title: string; blurb?: string>`
  - `<Reveal delayMs?: number>`

- [ ] **Step 1: Create `Panel`**

```tsx
import type { ReactNode } from "react";

const ACCENT = {
  green: "border-green/25 hover:border-green/50",
  cyan: "border-cyan/25 hover:border-cyan/50",
  purple: "border-purple/25 hover:border-purple/50",
} as const;

export function Panel({
  children,
  accent = "purple",
  className = "",
}: {
  children: ReactNode;
  accent?: keyof typeof ACCENT;
  className?: string;
}) {
  return (
    <div
      className={`rounded-sm border bg-panel/60 backdrop-blur-sm transition-colors ${ACCENT[accent]} ${className}`}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Create `TerminalFrame`**

Note the deliberate absence of fixed widths — the frame is styling, not layout, so it reflows on narrow screens.

```tsx
import type { ReactNode } from "react";

export function TerminalFrame({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-sm border border-hairline/40 bg-panel/80">
      <div className="flex items-center gap-2 border-b border-hairline/40 px-3 py-2">
        <span aria-hidden className="size-2 rounded-full bg-hairline/60" />
        <span aria-hidden className="size-2 rounded-full bg-hairline/60" />
        <span aria-hidden className="size-2 rounded-full bg-hairline/60" />
        <span className="ml-2 font-mono text-xs tracking-widest text-muted uppercase">
          {title}
        </span>
      </div>
      <div className="p-4 font-mono text-sm sm:p-6">{children}</div>
    </div>
  );
}
```

- [ ] **Step 3: Create `Tag`**

```tsx
export function Tag({ children }: { children: string }) {
  return (
    <span className="inline-block rounded-sm border border-hairline/40 px-2 py-1 font-mono text-xs text-muted">
      {children}
    </span>
  );
}
```

- [ ] **Step 4: Create `GlowButton`**

```tsx
import Link from "next/link";
import type { ReactNode } from "react";

export function GlowButton({
  href,
  children,
  variant = "primary",
  external = false,
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "ghost";
  external?: boolean;
}) {
  const base =
    "inline-flex items-center gap-2 rounded-sm border px-4 py-2 font-mono text-sm tracking-wide transition-all";
  const styles =
    variant === "primary"
      ? "border-cyan/60 text-cyan hover:bg-cyan/10 hover:shadow-glow-md"
      : "border-hairline/50 text-muted hover:border-cyan/50 hover:text-cyan";

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer noopener"
        className={`${base} ${styles}`}
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={`${base} ${styles}`}>
      {children}
    </Link>
  );
}
```

- [ ] **Step 5: Create `SectionHeading`**

```tsx
export function SectionHeading({
  id,
  index,
  title,
  blurb,
}: {
  id: string;
  index: string;
  title: string;
  blurb?: string;
}) {
  return (
    <header className="mb-10">
      <p className="font-mono text-xs tracking-[0.3em] text-purple uppercase">
        {index}
      </p>
      <h2 id={id} className="mt-2 font-mono text-2xl text-text sm:text-3xl">
        {title}
      </h2>
      {blurb ? <p className="mt-3 max-w-2xl text-muted">{blurb}</p> : null}
    </header>
  );
}
```

- [ ] **Step 6: Create `Reveal`**

```tsx
"use client";

import type { ReactNode } from "react";
import { useInView } from "@/lib/hooks/useInView";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";

export function Reveal({
  children,
  delayMs = 0,
}: {
  children: ReactNode;
  delayMs?: number;
}) {
  const reduced = usePrefersReducedMotion();
  const { ref, inView } = useInView<HTMLDivElement>();

  // With reduced motion the wrapper is inert: no transform, no transition,
  // no opacity change. Content is simply present.
  if (reduced) return <div>{children}</div>;

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delayMs}ms` }}
      className={`transition-all duration-700 ease-out ${
        inView ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      }`}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 7: Typecheck and commit**

```bash
npm run typecheck
git add -A
git commit -m "feat: add UI primitives

TerminalFrame styles rather than lays out, so the terminal aesthetic reflows
on narrow screens instead of forcing horizontal scroll. Reveal renders an
inert wrapper under reduced motion.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 7: Root layout, fonts and metadata

**Files:**
- Modify: `app/layout.tsx`
- Create: `app/not-found.tsx`

**Interfaces:**
- Consumes: `profile`
- Produces: font CSS variables `--font-jetbrains-mono` and `--font-inter` on `<html>`; site-wide metadata

- [ ] **Step 1: Replace `app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { profile } from "@/data/profile";
import "./globals.css";

// next/font/google downloads at build time and self-hosts the result — no
// runtime request to a third party, no font binaries committed.
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const SITE = "https://willembarendkruger.github.io";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: `${profile.name} — ${profile.role}`,
    template: `%s — ${profile.name}`,
  },
  description:
    "Software engineer building backend systems with C# and .NET, and the web interfaces on top of them. Currently working on enterprise applications and moving deeper into Azure.",
  openGraph: {
    type: "website",
    url: SITE,
    siteName: profile.name,
    title: `${profile.name} — ${profile.role}`,
    description:
      "Backend-focused software engineer. C#, .NET, TypeScript, React, Azure.",
    images: [{ url: "/images/og.png", width: 1200, height: 630, alt: profile.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${profile.name} — ${profile.role}`,
    description:
      "Backend-focused software engineer. C#, .NET, TypeScript, React, Azure.",
    images: ["/images/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${mono.variable} ${sans.variable}`}>
      <body>
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-sm focus:border focus:border-cyan focus:bg-panel focus:px-4 focus:py-2 focus:font-mono focus:text-sm focus:text-cyan"
        >
          Skip to content
        </a>
        <main id="content">{children}</main>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Create `app/not-found.tsx`**

```tsx
import { GlowButton } from "@/components/ui/GlowButton";
import { TerminalFrame } from "@/components/ui/TerminalFrame";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-screen max-w-2xl items-center px-4">
      <TerminalFrame title="willem@grimoire">
        <p className="text-muted">
          <span className="text-green">&gt;</span> resolve path
        </p>
        <h1 className="mt-4 text-xl text-text">404 — no such artifact</h1>
        <p className="mt-2 text-muted">
          That page does not exist. It may have been renamed or never written.
        </p>
        <div className="mt-6">
          <GlowButton href="/">Return to the grimoire</GlowButton>
        </div>
      </TerminalFrame>
    </div>
  );
}
```

- [ ] **Step 3: Note the deferred Open Graph image**

The metadata above references `/images/og.png`, which does not exist yet. It is generated in
Task 11 Step 5, once Playwright is installed and can render it deterministically. Until then the
link 404s, which affects nothing in development. **Do not hand-author a placeholder** — it would
be silently replaced two tasks later.

- [ ] **Step 4: Build and commit**

```bash
npm run build
git add -A
git commit -m "feat: add root layout, self-hosted fonts, metadata and 404

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 8: Hero, boot overlay and particle field

**Files:**
- Create: `components/effects/BootOverlay.tsx`, `components/effects/ParticleField.tsx`, `components/sections/Hero.tsx`

**Interfaces:**
- Consumes: `usePrefersReducedMotion`, `useTypewriter`, `profile`
- Produces: `<Hero />`

- [ ] **Step 1: Create `BootOverlay`**

```tsx
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
```

- [ ] **Step 2: Create `ParticleField`**

```tsx
"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";

type Particle = { x: number; y: number; vx: number; vy: number; r: number };

export function ParticleField() {
  const reduced = usePrefersReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (reduced) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let frame = 0;
    let particles: Particle[] = [];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
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
  }, [reduced]);

  if (reduced) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 size-full opacity-60"
    />
  );
}
```

- [ ] **Step 3: Create `Hero`**

```tsx
import { BootOverlay } from "@/components/effects/BootOverlay";
import { ParticleField } from "@/components/effects/ParticleField";
import { GlowButton } from "@/components/ui/GlowButton";
import { profile } from "@/data/profile";

const STACK = ["C#", ".NET", "TypeScript", "React", "Azure"];

export function Hero() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden px-4">
      <ParticleField />
      <BootOverlay />
      <div className="relative mx-auto w-full max-w-4xl py-24">
        <p className="font-mono text-xs tracking-[0.3em] text-green uppercase">
          System online
        </p>
        <h1 className="mt-4 font-mono text-4xl leading-tight text-text sm:text-6xl">
          {profile.name}
        </h1>
        <p className="mt-4 font-mono text-lg text-purple sm:text-xl">
          {profile.epithet} &middot; {profile.role}
        </p>
        <p className="mt-6 max-w-xl text-lg text-muted">
          I build systems that turn ideas into working software — backend first,
          with the interfaces that make them usable.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <GlowButton href="#projects">Enter the grimoire</GlowButton>
          <GlowButton href={profile.links[0].href} variant="ghost" external>
            View GitHub
          </GlowButton>
        </div>
        <ul className="mt-12 flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs tracking-widest text-muted uppercase">
          {STACK.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Build and commit**

```bash
npm run build
git add -A
git commit -m "feat: add hero, boot overlay and particle field

Boot overlay sits over already-rendered content, dismisses four ways, runs
once per session, and never mounts under reduced motion. Particle count
scales with viewport area.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 9: Remaining sections and homepage assembly

**Files:**
- Create: `components/sections/Identity.tsx`, `Spellbook.tsx`, `FeaturedProjects.tsx`, `Timeline.tsx`, `QuestLog.tsx`, `Connect.tsx`, `components/ui/ProjectCard.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: all data modules, all UI primitives
- Produces: `<Identity />`, `<Spellbook />`, `<FeaturedProjects />`, `<Timeline />`, `<QuestLog />`, `<Connect />`, `<ProjectCard project={Project} />`

- [ ] **Step 1: Create `Identity`**

```tsx
import Image from "next/image";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TerminalFrame } from "@/components/ui/TerminalFrame";
import { profile } from "@/data/profile";

export function Identity() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-24">
      <SectionHeading id="identity" index="01 // Identity" title="Who is typing" />
      <TerminalFrame title="willem@grimoire — whoami">
        <p className="text-green">&gt; whoami</p>
        <dl className="mt-4 grid gap-1 sm:grid-cols-[10rem_1fr]">
          <dt className="text-muted">name</dt>
          <dd className="text-text">{profile.name}</dd>
          <dt className="text-muted">role</dt>
          <dd className="text-text">{profile.role}</dd>
          <dt className="text-muted">focus</dt>
          <dd className="text-text">Backend / .NET</dd>
          <dt className="text-muted">location</dt>
          <dd className="text-text">{profile.location}</dd>
        </dl>
      </TerminalFrame>
      <div className="mt-10 flex flex-col gap-8 sm:flex-row sm:items-start">
        <Image
          src="/images/profile.png"
          alt="Willem Kruger"
          width={160}
          height={160}
          className="shrink-0 rounded-sm border border-hairline/40"
        />
        <div className="space-y-4 text-muted">
          {profile.summary.map((paragraph) => (
            <p key={paragraph.slice(0, 40)}>{paragraph}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Create `Spellbook`**

No numeric ratings — groups and names only.

```tsx
import { Panel } from "@/components/ui/Panel";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Tag } from "@/components/ui/Tag";
import { skillGroups } from "@/data/skills";

export function Spellbook() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-24">
      <SectionHeading
        id="spellbook"
        index="02 // Spellbook"
        title="What I work with"
        blurb="Grouped by where they sit in a system, not ranked. A percentage next to a language name would not tell you anything true."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {skillGroups.map((group, index) => (
          <Reveal key={group.id} delayMs={index * 80}>
            <Panel accent="purple" className="h-full p-5">
              <h3 className="font-mono text-sm tracking-widest text-purple uppercase">
                {group.title}
              </h3>
              <p className="mt-2 text-sm text-muted">{group.blurb}</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {group.skills.map((skill) => (
                  <li key={skill}>
                    <Tag>{skill}</Tag>
                  </li>
                ))}
              </ul>
            </Panel>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Create `ProjectCard`**

```tsx
import Image from "next/image";
import Link from "next/link";
import { Panel } from "@/components/ui/Panel";
import { Tag } from "@/components/ui/Tag";
import type { Project } from "@/data/types";

export function ProjectCard({ project }: { project: Project }) {
  const body = (
    <Panel accent={project.featured ? "cyan" : "purple"} className="h-full p-5">
      {project.image ? (
        <Image
          src={project.image}
          // Decorative: the project name and tagline directly below carry the
          // meaning, so alt text here would only repeat them.
          alt=""
          width={640}
          height={360}
          className="mb-4 w-full rounded-sm border border-hairline/30 object-cover"
        />
      ) : null}
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-mono text-lg text-text">{project.name}</h3>
        {project.collaboration === "team" ? (
          <span className="shrink-0 font-mono text-xs text-purple">team</span>
        ) : null}
      </div>
      <p className="mt-2 text-sm text-muted">{project.tagline}</p>
      <ul className="mt-4 flex flex-wrap gap-2">
        {project.technologies.slice(0, 6).map((tech) => (
          <li key={tech}>
            <Tag>{tech}</Tag>
          </li>
        ))}
      </ul>
      {project.featured ? (
        <p className="mt-4 font-mono text-xs text-cyan">Read the case study &rarr;</p>
      ) : (
        <p className="mt-4 font-mono text-xs text-muted">View source &rarr;</p>
      )}
    </Panel>
  );

  if (project.featured) {
    return (
      <Link href={`/projects/${project.slug}/`} className="block h-full">
        {body}
      </Link>
    );
  }
  return project.links.source ? (
    <a
      href={project.links.source}
      target="_blank"
      rel="noreferrer noopener"
      className="block h-full"
    >
      {body}
    </a>
  ) : (
    body
  );
}
```

- [ ] **Step 4: Create `FeaturedProjects`**

```tsx
import { ProjectCard } from "@/components/ui/ProjectCard";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { featuredProjects, projects } from "@/data/projects";

export function FeaturedProjects() {
  const others = projects.filter((project) => !project.featured);

  return (
    <section className="mx-auto max-w-5xl px-4 py-24">
      <SectionHeading
        id="projects"
        index="03 // Artifacts"
        title="What I've built"
        blurb="Two with full write-ups. The rest are linked to source."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {featuredProjects.map((project, index) => (
          <Reveal key={project.slug} delayMs={index * 80}>
            <ProjectCard project={project} />
          </Reveal>
        ))}
      </div>
      <h3 className="mt-16 font-mono text-sm tracking-widest text-muted uppercase">
        Also built
      </h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {others.map((project, index) => (
          <Reveal key={project.slug} delayMs={index * 60}>
            <ProjectCard project={project} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Create `Timeline`**

Single left rail at every breakpoint — no alternating sides.

```tsx
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { timeline } from "@/data/timeline";

export function Timeline() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-24">
      <SectionHeading
        id="timeline"
        index="04 // Quest log"
        title="How I got here"
      />
      <ol className="relative border-l border-hairline/40 pl-6">
        {timeline.map((entry, index) => (
          <li key={entry.title} className="pb-10 last:pb-0">
            <Reveal delayMs={index * 60}>
              <span
                aria-hidden
                className="absolute -left-[5px] size-2.5 rounded-full bg-purple"
              />
              <p className="font-mono text-xs tracking-widest text-purple uppercase">
                {entry.period}
              </p>
              <h3 className="mt-1 font-mono text-lg text-text">{entry.title}</h3>
              {entry.org ? (
                <p className="font-mono text-sm text-cyan">{entry.org}</p>
              ) : null}
              <p className="mt-2 text-muted">{entry.detail}</p>
            </Reveal>
          </li>
        ))}
      </ol>
    </section>
  );
}
```

- [ ] **Step 6: Create `QuestLog`**

```tsx
import { Panel } from "@/components/ui/Panel";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { quests } from "@/data/quests";

export function QuestLog() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-24">
      <SectionHeading
        id="quests"
        index="05 // Active quests"
        title="What I'm learning now"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {quests.map((quest, index) => (
          <Reveal key={quest.title} delayMs={index * 70}>
            <Panel accent="green" className="h-full p-5">
              <p className="font-mono text-xs tracking-widest text-green uppercase">
                [{quest.status}]
              </p>
              <h3 className="mt-2 font-mono text-lg text-text">{quest.title}</h3>
              <p className="mt-2 text-sm text-muted">{quest.detail}</p>
            </Panel>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 7: Create `Connect`**

```tsx
import { GlowButton } from "@/components/ui/GlowButton";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { profile } from "@/data/profile";

export function Connect() {
  return (
    // A <footer> here would sit inside the layout's <main>, where it is not a
    // page-level contentinfo landmark — the element would misrepresent itself.
    <section className="mx-auto max-w-3xl px-4 py-24">
      <SectionHeading
        id="connect"
        index="06 // Establish connection"
        title="Get in touch"
        blurb="Open to conversations about backend work, .NET, and anything cloud."
      />
      <div className="flex flex-wrap gap-3">
        <GlowButton href={`mailto:${profile.email}`} external>
          {profile.email}
        </GlowButton>
        {profile.links.map((link) => (
          <GlowButton key={link.href} href={link.href} variant="ghost" external>
            {link.label}
          </GlowButton>
        ))}
      </div>
      <p className="mt-16 font-mono text-xs text-muted">
        &copy; {new Date().getFullYear()} {profile.name}. Built with Next.js and
        TypeScript.{" "}
        <a
          href="https://github.com/WillemBarendKruger/WillemBarendKruger.github.io"
          target="_blank"
          rel="noreferrer noopener"
          className="underline decoration-hairline underline-offset-4 hover:text-cyan"
        >
          Source
        </a>
        .
      </p>
    </section>
  );
}
```

- [ ] **Step 8: Assemble `app/page.tsx`**

```tsx
import { Connect } from "@/components/sections/Connect";
import { FeaturedProjects } from "@/components/sections/FeaturedProjects";
import { Hero } from "@/components/sections/Hero";
import { Identity } from "@/components/sections/Identity";
import { QuestLog } from "@/components/sections/QuestLog";
import { Spellbook } from "@/components/sections/Spellbook";
import { Timeline } from "@/components/sections/Timeline";

export default function Home() {
  return (
    <>
      <Hero />
      <Identity />
      <Spellbook />
      <FeaturedProjects />
      <Timeline />
      <QuestLog />
      <Connect />
    </>
  );
}
```

- [ ] **Step 9: Build and commit**

```bash
npm run build
npm run typecheck
git add -A
git commit -m "feat: add all homepage sections

Skills are grouped with no numeric ratings. Timeline uses a single left rail
at every breakpoint rather than alternating sides, which collapses badly on
mobile.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 10: Case-study routes

**Files:**
- Create: `app/projects/[slug]/page.tsx`

**Interfaces:**
- Consumes: `projects`, `getProject`, UI primitives
- Produces: one statically-generated route per featured project

- [ ] **Step 1: Create the route**

```tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { GlowButton } from "@/components/ui/GlowButton";
import { Panel } from "@/components/ui/Panel";
import { Tag } from "@/components/ui/Tag";
import { featuredProjects, getProject } from "@/data/projects";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return featuredProjects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return { title: project.name, description: project.tagline };
}

export default async function ProjectPage({ params }: Params) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project?.caseStudy) notFound();

  const study = project.caseStudy;

  return (
    <article className="mx-auto max-w-3xl px-4 py-20">
      <GlowButton href="/" variant="ghost">
        &larr; Back
      </GlowButton>

      <header className="mt-10">
        <p className="font-mono text-xs tracking-[0.3em] text-purple uppercase">
          Artifact
        </p>
        <h1 className="mt-2 font-mono text-3xl text-text sm:text-4xl">
          {project.name}
        </h1>
        <p className="mt-4 text-lg text-muted">{project.tagline}</p>
        {project.attribution ? (
          <p className="mt-4 border-l-2 border-purple/50 pl-4 text-sm text-muted">
            {project.attribution}
          </p>
        ) : null}
        <ul className="mt-6 flex flex-wrap gap-2">
          {project.technologies.map((tech) => (
            <li key={tech}>
              <Tag>{tech}</Tag>
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-wrap gap-3">
          {project.links.source ? (
            <GlowButton href={project.links.source} external>
              View source
            </GlowButton>
          ) : null}
          {project.links.live ? (
            <GlowButton href={project.links.live} variant="ghost" external>
              View live
            </GlowButton>
          ) : null}
        </div>
      </header>

      <section className="mt-16">
        <h2 className="font-mono text-sm tracking-widest text-purple uppercase">
          The problem
        </h2>
        <p className="mt-3 text-muted">{study.problem}</p>
      </section>

      <section className="mt-12">
        <h2 className="font-mono text-sm tracking-widest text-purple uppercase">
          Architecture
        </h2>
        <dl className="mt-4 space-y-3">
          {study.architecture.map((row) => (
            <div key={row.layer} className="grid gap-1 sm:grid-cols-[10rem_1fr]">
              <dt className="font-mono text-sm text-cyan">{row.layer}</dt>
              <dd className="text-muted">{row.detail}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-12">
        <h2 className="font-mono text-sm tracking-widest text-purple uppercase">
          What it does
        </h2>
        <ul className="mt-4 space-y-2">
          {study.features.map((feature) => (
            <li key={feature} className="text-muted">
              <span aria-hidden className="mr-2 text-green">
                &#9670;
              </span>
              {feature}
            </li>
          ))}
        </ul>
      </section>

      {study.planned.length > 0 ? (
        <section className="mt-12">
          <Panel accent="purple" className="p-5">
            <h2 className="font-mono text-sm tracking-widest text-purple uppercase">
              Not built yet
            </h2>
            <p className="mt-2 text-sm text-muted">
              Listed separately because it is not in the code today.
            </p>
            <ul className="mt-4 space-y-2">
              {study.planned.map((item) => (
                <li key={item} className="text-muted">
                  <span aria-hidden className="mr-2 text-hairline">
                    &#9671;
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </Panel>
        </section>
      ) : null}

      <section className="mt-12">
        <h2 className="font-mono text-sm tracking-widest text-purple uppercase">
          What I learned
        </h2>
        <p className="mt-3 text-muted">{study.learned}</p>
      </section>
    </article>
  );
}
```

- [ ] **Step 2: Build and verify both routes exported**

```bash
npm run build
ls out/projects/apex-it/index.html out/projects/potholio/index.html
```

Expected: both files exist.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add case-study routes

Unbuilt work renders in a visually distinct 'Not built yet' panel, so a
reader cannot mistake planned work for shipped work.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 11: Accessibility and responsive test suite

**Files:**
- Create: `playwright.config.ts`, `e2e/site.spec.ts`

**Interfaces:**
- Consumes: the built site
- Produces: a suite gating deployment

- [ ] **Step 1: Install Playwright**

```bash
npm install --save-dev @playwright/test @axe-core/playwright
npx playwright install --with-deps chromium
```

- [ ] **Step 2: Configure Playwright against the exported output**

Create `playwright.config.ts`:

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  reporter: "list",
  use: { baseURL: "http://127.0.0.1:3000", trace: "on-first-retry" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // Serves the real static export, so the tests exercise what actually ships.
  webServer: {
    command: "npx serve out -l 3000",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
```

Install the static server and add scripts:

```bash
npm install --save-dev serve
```

```json
"test:e2e": "playwright test"
```

- [ ] **Step 3: Write the suite**

Create `e2e/site.spec.ts`:

```ts
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("homepage renders with no console errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Willem Kruger");
  expect(errors).toEqual([]);
});

test("exactly one h1 on the homepage", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toHaveCount(1);
});

test("boot overlay dismisses on Escape", async ({ page }) => {
  await page.goto("/");
  const overlay = page.getByRole("status");
  // It may already have auto-dismissed; either way it must be gone after Esc.
  await page.keyboard.press("Escape");
  await expect(overlay).toHaveCount(0);
});

test("skip link is reachable by keyboard and targets content", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Escape");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: /skip to content/i });
  await expect(skip).toBeFocused();
  await expect(page.locator("#content")).toHaveCount(1);
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("page is complete and the boot overlay never appears", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("status")).toHaveCount(0);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("heading", { name: /what i've built/i })).toBeVisible();
    await expect(page.locator("canvas")).toHaveCount(0);
  });
});

test("no horizontal scroll at 320px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto("/");
  await page.keyboard.press("Escape");
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});

test("homepage has no axe violations", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Escape");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});

test("case study has no axe violations", async ({ page }) => {
  await page.goto("/projects/apex-it/");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});

test("case study separates built from unbuilt work", async ({ page }) => {
  await page.goto("/projects/apex-it/");
  await expect(page.getByRole("heading", { name: /not built yet/i })).toBeVisible();
});
```

- [ ] **Step 4: Run the suite**

```bash
npm run build
npm run test:e2e
```

Expected: all tests pass. **If the axe or 320px tests fail, fix the site, not the test.** Those two encode spec §10 and are the point of the suite.

- [ ] **Step 5: Generate the Open Graph image**

Deferred here from Task 7 because Playwright can render it deterministically, which nothing
available in Task 7 could.

Create `scripts/make-og.mjs`:

```js
import { chromium } from "@playwright/test";

const html = `<!doctype html>
<html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
<style>
  html,body{margin:0;padding:0}
  body{width:1200px;height:630px;background:#05070A;color:#C9D1D9;
       font-family:'JetBrains Mono',monospace;display:flex;flex-direction:column;
       justify-content:center;padding:0 80px;box-sizing:border-box}
  .tag{color:#39FF88;font-size:20px;letter-spacing:.3em;text-transform:uppercase}
  h1{font-size:82px;margin:24px 0 0;font-weight:700}
  .role{color:#9B5CFF;font-size:30px;margin-top:16px}
  .stack{color:#8B949E;font-size:22px;margin-top:56px;letter-spacing:.2em}
</style></head>
<body>
  <div class="tag">System online</div>
  <h1>WILLEM KRUGER</h1>
  <div class="role">Software Engineer &middot; Backend / .NET</div>
  <div class="stack">C# &nbsp; .NET &nbsp; TYPESCRIPT &nbsp; REACT &nbsp; AZURE</div>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html, { waitUntil: "networkidle" });
await page.screenshot({ path: "public/images/og.png" });
await browser.close();
console.log("wrote public/images/og.png");
```

Run it and verify:

```bash
node scripts/make-og.mjs
node -e "console.log(require('fs').statSync('public/images/og.png').size)"
```

Expected: a non-zero byte count. The script is committed so the image can be regenerated after
a copy or palette change, rather than being a binary nobody can reproduce.

- [ ] **Step 6: Commit**

```bash
npm run build
git add -A
git commit -m "test: add accessibility and responsive e2e suite

Runs against the real static export rather than a dev server, so the tests
exercise what actually ships. Covers axe on two routes, reduced motion,
keyboard skip link, and 320px overflow.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 12: Deployment workflow

**Files:**
- Create: `.github/workflows/deploy.yml`, `README.md`

**Interfaces:**
- Consumes: `npm run typecheck`, `npm test`, `npm run build`
- Produces: a Pages deployment on every push to `main`

- [ ] **Step 1: Create the workflow**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  pull_request:
  workflow_dispatch:

# Allow one concurrent deployment; let in-progress runs finish.
concurrency:
  group: pages
  cancel-in-progress: false

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci

      - name: Typecheck
        run: npm run typecheck

      - name: Unit tests
        run: npm test

      - name: Build
        run: npm run build

      - name: Install Playwright browser
        run: npx playwright install --with-deps chromium

      - name: End-to-end tests
        run: npm run test:e2e

      - name: Configure Pages
        if: github.ref == 'refs/heads/main'
        uses: actions/configure-pages@v5

      - name: Upload artifact
        if: github.ref == 'refs/heads/main'
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./out

  deploy:
    if: github.ref == 'refs/heads/main'
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Write the README**

Create `README.md`:

```markdown
# willembarendkruger.github.io

Personal portfolio. Next.js App Router, TypeScript, Tailwind CSS v4, statically
exported and deployed to GitHub Pages by GitHub Actions.

## Develop

```bash
npm install
npm run dev
```

## Verify

```bash
npm run typecheck   # tsc --noEmit
npm test            # Vitest: colour maths, design tokens, hooks, data validation
npm run build       # Static export to out/ — fails on invalid content
npm run test:e2e    # Playwright: axe, reduced motion, keyboard, 320px overflow
```

## Editing content

All content lives in `data/`. Each file owns one concern:

| File | Contents |
|---|---|
| `profile.ts` | Name, role, summary, contact links |
| `skills.ts` | Skill groups |
| `projects.ts` | Projects and case studies |
| `timeline.ts` | Career and education timeline |
| `quests.ts` | Current learning |

Adding a project means editing `projects.ts` only — the homepage grid, the
case-study route and `generateStaticParams` all derive from it. `data/validate.ts`
runs at import, so malformed content fails the build rather than shipping.

`caseStudy.features` is for work that exists in the code. `caseStudy.planned` is
for work that does not. Keep the distinction honest.

## Deployment

Pushing to `main` builds and deploys. Repository Settings → Pages → Source must
be set to **GitHub Actions**.

The previous HTML5 UP site is preserved at tag `v1-html5up`.
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "ci: add Pages deployment workflow and README

Typecheck, unit tests, build and e2e all gate the deploy.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

- [ ] **Step 4: Push and open the pull request**

```bash
git push -u origin feat/portfolio-rebuild
```

Open a PR from `feat/portfolio-rebuild` into `main`. In the description include the resolved dependency versions captured in Task 1 Step 6.

- [ ] **Step 5: Hand the manual step to Willem**

**This cannot be automated — `gh` is not installed.** After the PR merges, Willem must set Settings → Pages → Source to **GitHub Actions**. Until he does, `willembarendkruger.github.io` returns 404.

Tell him explicitly at merge time, not before.

---

## Self-Review

**Spec coverage.** §4 migration → Task 1. §5 architecture → Tasks 1, 6, 7, 9, 10. §6 design system → Task 2 (tokens, contrast) and Task 7 (fonts). §7 motion and boot → Tasks 3, 8. §8 data model → Tasks 4, 5. §9 content → Task 5. §10 accessibility and responsive → Tasks 6, 7, 9, 11. §11 testing → Tasks 2, 3, 4, 11. §12 deployment → Task 12. §13 risks → mitigations land in Task 1 Step 1 (tag), Task 12 Step 5 (Pages window), Task 8 (boot), Task 5 (`planned` split).

**Gap found and closed.** The spec's §5 file listing named `components/ui/ProjectCard.tsx` only implicitly; it is now an explicit deliverable in Task 9 Step 3.

**Known soft spot.** Task 7 Step 3 (Open Graph image) is the one step that cannot be fully scripted here, because generating a PNG needs either a design tool or a dependency the spec does not justify. It is written as a concrete manual instruction with exact dimensions, colours and copy rather than a placeholder.

**Type consistency.** `useInView` returns `{ ref, inView }` in Task 3 and is consumed as such in Task 6. `useTypewriter(text, { speedMs, enabled })` is defined once and used with that signature throughout. `validateProjects` is defined in Task 4 and invoked in Task 5. `Project`, `CaseStudy`, `SkillGroup`, `TimelineEntry`, `Quest` and `Profile` are defined in Task 4 Step 3 and referenced consistently thereafter. `caseStudy.planned` is required by the type and rendered in Task 10.
