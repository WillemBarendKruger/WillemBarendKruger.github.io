# Portfolio Rebuild — Design Spec

**Date:** 2026-09-16
**Repo:** `WillemBarendKruger/WillemBarendKruger.github.io`
**Branch:** `feat/portfolio-rebuild`
**Status:** Approved design, pending implementation plan

---

## 1. Goal

Replace the existing HTML5 UP static site with a Next.js + TypeScript portfolio whose
implementation is itself evidence of the engineering ability it claims. The site must read as
the work of a software engineer with a backend/.NET focus, not a beginner web developer.

The narrative the visitor moves through: who Willem is → what he knows → what he has built →
how he thinks → what he is learning → where to find the code.

Visual identity: a futuristic developer terminal crossed with an arcane spellbook, kept
professional. Theme lives in the UI layer; the content stays credible.

---

## 2. Decisions

| # | Decision | Rationale |
|---|---|---|
| D1 | Next.js (current major) App Router, TypeScript, Tailwind v4, static export | Demonstrates the claimed stack; static export is all this site needs. Amended 2026-09-16: current published Next is 16.3.5, not 15 as originally drafted. The scaffold takes whatever `create-next-app@latest` resolves rather than pinning versions guessed at design time |
| D2 | No animation library | Every effect required is enter-once or state-based; hand-rolled hooks cost ~60 lines vs ~35 KB gzipped |
| D3 | Deploy to GitHub Pages via GitHub Actions | Preserves `willembarendkruger.github.io`, already printed on the CV; keeps `main` source-only |
| D4 | One narrative homepage + a route per featured project | The story reads as a continuous descent; case studies need their own room |
| D5 | All work on `feat/portfolio-rebuild`, merged by PR | Matches Willem's established workflow across his other repos |
| D6 | Employment shown as Boxfusion + Shesha, no client detail | Client confidentiality; Shesha is open-source and safe to name |
| D7 | No runtime GitHub API | Reliability — a rate-limited API must not break the portfolio |

---

## 3. Scope

**In scope.** Homepage (hero/boot, identity, spellbook, featured projects, timeline, active
quests, connect), a case-study route per featured project, design system, motion primitives,
typed data layer, accessibility baseline, responsive layouts, test suite, CI/CD to Pages, SEO
and Open Graph metadata, favicon.

**Out of scope.** Blog, CMS, runtime GitHub API integration, contact form backend (contact is
`mailto:` plus social links), dark/light toggle (the site is dark by design), i18n, analytics.

---

## 4. Repo migration

Before any deletion: `git tag v1-html5up && git push origin v1-html5up`. The old site is the
only copy and must stay recoverable.

**Delete:** `index.html`, `Projects-page.html`, `education-page.html`, `assets/css/`,
`assets/js/`, `assets/sass/`, `assets/webfonts/`, `LICENSE.txt` (licenses the removed
template), `README.txt`.

**Migrate into `public/images/`**, renamed to remove spaces: `Profile pic-transperent.png` →
`profile.png`; `Employee-management.png` → `employee-management.png`; `WebApp.png` →
`sen371-web-app.png`; `Neural-Instant-Search-social.gif` → `wpr371-song-search.gif`.

**Drop:** `background-banner.jpg`, `BC-itveristy.webp`, `fahim-muntashir-Projects.jpg`,
`john-schnobrich-Education.jpg` — stock imagery works against the design direction.

**Hold:** the 2025 CV PDF moves to `public/cv/` but is **not linked**. It brands Willem as a
JavaScript/Node/AWS developer, contradicting the .NET/Azure identity the site projects. No
résumé download ships until an updated CV is supplied; the file's presence makes that a
drop-in replacement.

---

## 5. Architecture

```
app/
  layout.tsx                 root metadata, fonts, skip-link, <main>
  page.tsx                   the narrative homepage
  projects/[slug]/page.tsx   case study; generateStaticParams from data
  not-found.tsx
  globals.css                design tokens + Tailwind v4 @theme
components/
  sections/  Hero Identity Spellbook FeaturedProjects Timeline QuestLog Connect
  ui/        Panel TerminalFrame Tag GlowButton SectionHeading Reveal
  effects/   BootOverlay ParticleField
lib/hooks/   useInView useTypewriter usePrefersReducedMotion
data/        profile.ts skills.ts projects.ts timeline.ts quests.ts types.ts validate.ts
public/      images/ cv/ .nojekyll
.github/workflows/deploy.yml
```

Server Components by default. `"use client"` appears in exactly four places: `BootOverlay`,
`ParticleField`, `Reveal`, and the `Spellbook` card interaction. Section components are server
components rendering typed data, which keeps the exported HTML complete and the JS payload
small.

`Reveal` is the single scroll-animation wrapper — sections wrap children in it rather than each
implementing an observer. One place to fix, one place to disable.

---

## 6. Design system

Tokens are CSS custom properties in `globals.css`, exposed to Tailwind v4 via `@theme`. No
colour literal appears in any component.

| Token | Value | Use |
|---|---|---|
| `--bg` | `#05070A` | page background |
| `--panel` | `#0D1117` | panels, cards, terminal frames |
| `--green` | `#39FF88` | system and status only |
| `--cyan` | `#00E5FF` | links, interactive affordances, focus rings |
| `--purple` | `#9B5CFF` | arcane layer — section markers, dividers, particles |
| `--text` | `#C9D1D9` | body text |
| `--muted` | `#8B949E` | secondary text |
| `--hairline` | `#6E7681` | borders, grid lines, disabled — **non-text only** |

**Contrast correction.** The brief's `#6E7681` muted text on `#05070A` computes to ≈4.4:1,
below the 4.5:1 WCAG AA threshold for body text. Muted text is therefore `#8B949E` (≈6.3:1),
and `#6E7681` is demoted to non-text use. Every foreground/background pair is verified by a
contrast script during implementation, not by eye.

**Accent discipline** prevents the "everything is neon" failure: green = system/status, cyan =
interactive, purple = arcane decoration. Glow is a `box-shadow` token at three intensities,
never applied to body text.

**Type.** JetBrains Mono for terminal and display; Inter for body. Both loaded via
`next/font/google`, which downloads and **self-hosts at build time** — no runtime request to a
third party, and no font binaries committed to the repo. (Amended 2026-09-16 from
`next/font/local`, which would have required committing font files by hand for no benefit.)

---

## 7. Motion and the boot sequence

The boot sequence is the highest-risk element and is designed defensively.

The full page renders into the DOM immediately. The boot sequence is an **overlay on top of
already-present content**, never a gate in front of absent content. Crawlers, no-JS visitors
and screen readers all reach the real page. It auto-dismisses after ~1.8s, dismisses instantly
on click / Esc / any key, carries a visible skip affordance, and runs **once per session**
via `sessionStorage` so returning to the homepage never replays it.

Reduced motion is enforced at two levels:

1. A global CSS rule collapsing all animation and transition durations under
   `prefers-reduced-motion: reduce`.
2. JS-side — `BootOverlay` never mounts, `useTypewriter` returns the complete string on first
   render, `ParticleField` returns `null`.

The site is fully functional and visually complete with zero animation.

`ParticleField` renders to `<canvas>`, hero only, unmounts once scrolled past, and caps
particle count by viewport area so phones do not burn battery.

---

## 8. Data model

```ts
export type Project = {
  slug: string;
  name: string;
  tagline: string;
  featured: boolean;
  status: "live" | "in-progress" | "archived";
  collaboration: "solo" | "team";
  technologies: readonly string[];
  links: { source?: string; live?: string };
  caseStudy?: {
    problem: string;
    architecture: readonly { layer: string; detail: string }[];
    features: readonly string[];
    planned: readonly string[];
    learned: string;
  };
};
```

Data files use `satisfies readonly Project[]` for literal inference plus shape checking. Adding
a project means editing one file; the homepage grid, the detail routes and
`generateStaticParams` all derive from it.

**Error handling on a static site is data-integrity checking.** `data/validate.ts` asserts
unique slugs, well-formed URLs, and that every `featured: true` project carries a complete
`caseStudy`. It runs in tests *and* is imported by the build, so malformed data fails the build
rather than shipping a broken card. Unknown slugs resolve to `not-found.tsx`. Images use
`next/image` with static imports, so a missing file is a build error.

---

## 9. Verified content inventory

Every claim below was read from source. Nothing here is inferred unless marked.

### Identity

Willem Barend Kruger. Graduate Software Engineer at Boxfusion. Based in Mpumalanga, South
Africa. GitHub `WillemBarendKruger`. Email `willem.kruger11@gmail.com`.

### Employment

**Boxfusion — Graduate Software Engineer.** Enterprise systems built on Shesha, Boxfusion's
open-source .NET/Next.js low-code framework. **No client names, project names, sectors or
architecture specifics appear anywhere on the site** — a hard constraint, not a preference.

Start date **May 2025 — VERIFIED.** Confirmed by Willem on 2026-09-16. Corroborated by the
earliest commit across all graduate-programme repositories (`github-challenge`, 2025-05-09).

### Education

Bachelor of Information Technology, Belgium Campus ITversity, Kempton Park. **2021–2024 —
VERIFIED**, confirmed by Willem on 2026-09-16, resolving a conflict between the old education
page ("January 2022 – December 2024") and the 2025 CV ("2021–2024") in favour of the latter.

Coursework, from the CV: object-oriented programming, data structures, software engineering,
web development, software analysis and design, software testing, database development, data
analytics, business intelligence.

**Deliberately excluded.** The old site claimed "Graduated with Honors, GPA 3.2/4.0" and
"Certified Software Developer – Belgium Campus". Neither could be corroborated from any other
source, and when asked to confirm them Willem restated the qualification as the degree alone.
They do not appear on the site. The education entry is the degree, the institution and the
dates — nothing further.

Milestone project: aviation safety weather observation system — reads temperature, humidity and
light from onboard sensors, warns pilots of hazardous conditions, transmits readings to a web
page via ESP32.

### Projects

**Apex-IT — Office Equipment Management System.** Featured, full case study.
`github.com/WillemBarendKruger/Apex-IT`. Solo, 129 commits, most recent activity 2026-08-24.

*Built (verified in source):* ABP Framework v9 / .NET 8 backend; Next.js 15 + TypeScript +
Ant Design frontend; PostgreSQL; JWT auth; role-based access for supervisors and employees;
equipment cataloguing and tracking; condition reporting; email via SendGrid
(`SendGridEmailService`, called from `EmployeeAppService`); Google Gemini AI — image analysis
(`GeminiImageAnalysis`) and a troubleshooting chatbot (`OfficeBot`) handling both image and
text; image upload; Docker for backend and frontend; two GitHub Actions workflows building
backend and frontend on push and pull request.

*Not built — belongs in `planned`, never in `features`:* automated tests in CI (`dotnet test`
is commented out); any deploy/CD step (the frontend workflow's deploy is a commented
placeholder).

The case study says "containerised, with GitHub Actions building backend and frontend on every
pull request". It does **not** say "CI/CD pipeline" unqualified, and does not imply automated
test coverage.

**Potholio — pothole reporting platform.** Featured, full case study, labelled team work.
`github.com/Anroux11/Potholio`. .NET backend + Next.js frontend, Docker Compose. 207 commits
total across the team, **48 of them Willem's**, 126 merged pull requests. This is the only
evidence of sustained team collaboration in the portfolio — the old site claimed teamwork but
never demonstrated it. Repository lives on a teammate's account; the card states this.

**Confirmed in source on 2026-09-16** (against a local clone of the repository): `Municipality.cs`
entity and `MunicipalityAppService`; `Incident.cs` entity and `IncidentDto` under `Reports`;
`RegisterAppService` and `AccountAppService` with `RegisterInput`/`RegisterOutput` DTOs; and the
backend split across `Potholio.Application`, `Potholio.Core`, `Potholio.Web.Host`,
`Potholio.EntityFrameworkCore`, `Potholio.Web.Core` and `Potholio.Migrator`.

**Short cards.**

- *FitFusion* — personal trainer platform. Next.js + TypeScript. Trainers manage clients, meal
  plans and food items; clients view assigned plans. 47 commits, 45 merged PRs.
  `github.com/WillemBarendKruger/graduate-frontend-project-personal-trainer-platform`
- *React Developer Dashboard* — React + TypeScript + Vite against the public GitHub API.
  Search, favourites with persistence, profile views. Built to a Figma design. 24 commits.
  `github.com/WillemBarendKruger/React-Developer-Dashboard`
- *IT Asset Management* — Shesha/.NET asset management. Domain entities (Equipment, Category,
  AccessRequest, ConditionReport, PersonEquipment), app services, and specification-based
  filtering. 6 merged PRs. `github.com/WillemBarendKruger/itassetmanagent`
- *Ride-Along* — C# ride-sharing simulation exercising interfaces, abstract classes and a
  rating service. `github.com/WillemBarendKruger/Ride-Along-Ride-Sharing-System`

**Carried from the old site** as small cards, marked as 2022–2024 coursework: NodeJS song
searcher (`WPR371_Assignment1`), C# Employee Management System
(`Employee-management-system-Project`), SEN371 team web application (`HenryG-code/SEN371-project`).

**Excluded:** `practice-frontend-project` and `github-challenge` (2–5 commits, no substance),
`Backend-Deploy-test` (scratch repo), `Boxfusion-Frontend-Interim-Project` (plain HTML/CSS/JS).

### Skills

Grouped, with **no numeric proficiency ratings** — the brief rules them out as arbitrary.
Groups: Primary Arcana (C#, .NET, ASP.NET Core / ABP, REST APIs, Entity Framework, PostgreSQL,
SQL Server), Web Arcana (TypeScript, React, Next.js, JavaScript, Ant Design, HTML, CSS), Cloud
Arcana (Azure, GitHub Actions, Docker, Vercel), Developer Arsenal (Git, GitHub, VS Code, Visual
Studio, Postman, Bash).

### Active quests

Azure development; AZ-204 Azure Developer Associate certification; C# unit testing and
maintainable backend design; practical AI integration. Lives in `data/quests.ts` so Willem can
edit one file to update the section.

### Out of bounds

The employer's client project directories are Boxfusion client
work. **No content from them appears on the site in any form.**

---

## 10. Accessibility and responsive

The terminal aesthetic's specific mobile hazard is that ASCII-box layouts want fixed character
widths. Terminal framing is therefore **styling, not layout** — bordered panels with a
monospace type treatment and a title bar, reflowing normally. No horizontal scroll at 320px,
verified rather than assumed.

The timeline is a single left-hand rail at every breakpoint. Alternating-side timelines are the
classic layout that collapses badly on mobile.

Baseline: semantic landmarks, exactly one `h1`, skip-to-content link, visible focus rings in
cyan at 2px offset (never `outline: none`), every interactive element reachable and operable by
keyboard, `alt` text on every image, decorative canvas `aria-hidden`.

---

## 11. Testing

Proportionate to a static site.

- **Vitest** — `useTypewriter` (completion, reduced-motion short-circuit), `useInView`
  (fire-once), and `data/validate.ts` invariants.
- **Playwright** — homepage renders without console errors; boot overlay dismisses on Esc; under
  `prefers-reduced-motion: reduce` the page is complete and static; keyboard tab order reaches
  every interactive element; `@axe-core/playwright` passes on the homepage and one case-study
  route; no horizontal scroll at 320px.
- **The build is the integration test.** `next build` fails on bad data or a missing image, and
  runs in CI before deploy.

TDD applies to the hooks and the validator, which carry real logic. It is not applied to JSX
layout, where it would be ceremony rather than verification.

---

## 12. Deployment

`next.config.ts`: `output: 'export'`, `images.unoptimized: true` (the optimiser needs a server),
`trailingSlash: true` for Pages path resolution. No `basePath` — a user site serves from root.
`public/.nojekyll` guards against underscore-prefixed `_next/` being stripped.

`.github/workflows/deploy.yml`, on push to `main`: install → typecheck → test → build →
`upload-pages-artifact` → `deploy-pages`. Tests gate the deploy.

**Manual step, Willem only.** Repo Settings → Pages → Source must change from "Deploy from a
branch" to "GitHub Actions". The `gh` CLI is not installed on this machine, so this cannot be
automated. **The site returns 404 between merging to `main` and this switch being flipped.**

---

## 13. Risks

| Risk | Mitigation |
|---|---|
| Old site is the only copy | Tag `v1-html5up` and push before any deletion |
| Pages 404 window after merge | Flip the Pages setting immediately after the first merge; do it as a deliberate step, not an afterthought |
| Boot sequence blocks or annoys | Overlay over rendered content, skippable four ways, once per session, absent under reduced motion |
| Overclaiming a project feature | Every claim traced to source in §9; unbuilt items live in `planned` |
| Client confidentiality breach | Hard constraint in §9; no client material enters the repo |
| Unverified personal facts published | All resolved 2026-09-16 — employment start, degree dates confirmed; uncorroborated honours/GPA/certification claims dropped |
| Stale CV undermines positioning | Not linked; ships only when replaced |

---

## 14. Success criteria

1. Site builds, exports and deploys to `willembarendkruger.github.io` via GitHub Actions.
2. Every factual claim traces to §9 or to a source Willem confirmed.
3. No client-derived content anywhere in the repository or site.
4. Fully usable with JavaScript disabled and under `prefers-reduced-motion: reduce`.
5. axe reports no violations on the homepage or a case-study route.
6. No horizontal scroll at 320px.
7. Adding a project requires editing exactly one file.
8. Lighthouse ≥ 95 for Performance and Accessibility on the homepage.
