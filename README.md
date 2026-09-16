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
