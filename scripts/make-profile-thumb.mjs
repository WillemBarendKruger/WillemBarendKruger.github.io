// Downscales public/images/profile.png in place. Committed and reproducible,
// like scripts/make-og.mjs — a Playwright screenshot rather than a new
// image-processing dependency.
//
// Target: ~320px wide (plenty for a 160px slot at 2x display density),
// preserving the source's native ~2:3 aspect ratio (853x1280).
import { chromium } from "@playwright/test";
import { renameSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const imagesDir = path.resolve(__dirname, "../public/images");
const target = path.join(imagesDir, "profile.png");
const tmpOut = path.join(imagesDir, "profile.thumb.tmp.png");
const tmpHtml = path.join(imagesDir, "_profile-thumb.tmp.html");

const width = 320;
const height = 480;

writeFileSync(
  tmpHtml,
  `<!doctype html>
<html><head><meta charset="utf-8">
<style>
  html,body{margin:0;padding:0}
  img{display:block;width:${width}px;height:${height}px;object-fit:cover}
</style></head>
<body><img src="profile.png"></body></html>`,
);

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.goto(`file://${tmpHtml.replace(/\\/g, "/")}`);
  await page.waitForLoadState("networkidle");
  await page.screenshot({ path: tmpOut });
} finally {
  await browser.close();
  rmSync(tmpHtml, { force: true });
}

renameSync(tmpOut, target);
console.log(`wrote ${target} at ${width}x${height}`);
