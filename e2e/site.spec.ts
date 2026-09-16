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
