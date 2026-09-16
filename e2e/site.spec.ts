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

// I8(b): the reduced-motion suite below only asserts the boot overlay and
// canvas are ABSENT. Nothing previously asserted they ever APPEAR under
// default motion, so deleting either component outright would have kept the
// whole suite green.
test("boot overlay appears under default motion and auto-dismisses", async ({ page }) => {
  await page.goto("/");
  const overlay = page.getByRole("status");
  await expect(overlay).toBeVisible();
  await expect(overlay).toHaveCount(0, { timeout: 4000 });
});

test("exactly one particle-field canvas exists under default motion", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Escape");
  await expect(page.locator("canvas")).toHaveCount(1);
});

// I8(c) / C1 regression coverage: this is the geometry check that would have
// caught the dot-on-top-of-text bug. It asserts both halves of the fix —
// Reveal actually animates in (the ref/hydration fix), and the dot's
// horizontal position matches the rail's (the containing-block fix) — under
// default (non-reduced) motion, where the original bug manifested.
test("timeline reveal animates in and the dot lands on the rail", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Escape");

  const section = page.locator("section", {
    has: page.getByRole("heading", { name: /how i got here/i }),
  });
  await section.scrollIntoViewIfNeeded();

  const firstReveal = section.locator("ol > li div.transition-transform").first();
  const firstDot = section.locator("ol > li > span[aria-hidden]").first();
  const rail = section.locator("ol");

  await expect(firstReveal).toHaveClass(/translate-y-0/);

  const railBox = await rail.boundingBox();
  const dotBox = await firstDot.boundingBox();
  expect(railBox).not.toBeNull();
  expect(dotBox).not.toBeNull();
  const dotCenterX = dotBox!.x + dotBox!.width / 2;
  // The dot is a 10px circle centred on the rail (the ol's left border). If
  // its containing block resolves to the Reveal wrapper instead (the C1 bug),
  // this drifts by ~24px (a translate-y-4 wrapper plus its own offset) —
  // enough to land on top of the entry's text instead of the rail.
  expect(Math.abs(dotCenterX - railBox!.x)).toBeLessThanOrEqual(4);
});

test("clicking a featured project card opens its case study", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Escape");
  const card = page.locator('a[href^="/projects/"]').first();
  await card.click();
  await expect(page).toHaveURL(/\/projects\/.+\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
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
