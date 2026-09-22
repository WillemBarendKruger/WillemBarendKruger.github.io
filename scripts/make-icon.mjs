// Generates app/icon.png — the App Router favicon — the same way
// scripts/make-og.mjs generates the OG image: a committed, reproducible
// Playwright screenshot rather than a binary edited by hand.
import { chromium } from "@playwright/test";

const SIZE = 512;

const html = `<!doctype html>
<html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@700&display=swap" rel="stylesheet">
<style>
  html,body{margin:0;padding:0}
  body{
    width:${SIZE}px;height:${SIZE}px;background:#04100B;
    display:flex;align-items:center;justify-content:center;
    box-sizing:border-box;
  }
  .glyph{
    width:100%;height:100%;
    display:flex;align-items:center;justify-content:center;
    font-family:'JetBrains Mono',monospace;font-weight:700;
    font-size:300px;line-height:1;color:#39FF88;
    text-shadow:0 0 44px rgba(57,255,136,0.5);
  }
</style></head>
<body><div class="glyph">W</div></body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: SIZE, height: SIZE } });
await page.setContent(html, { waitUntil: "networkidle" });
await page.screenshot({ path: "app/icon.png" });
await browser.close();
console.log("wrote app/icon.png");
