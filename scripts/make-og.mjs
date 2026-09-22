import { chromium } from "@playwright/test";

const html = `<!doctype html>
<html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
<style>
  html,body{margin:0;padding:0}
  body{width:1200px;height:630px;background:#04100B;color:#C9D1D9;
       font-family:'JetBrains Mono',monospace;display:flex;flex-direction:column;
       justify-content:center;padding:0 80px;box-sizing:border-box}
  .tag{color:#39FF88;font-size:20px;letter-spacing:.3em;text-transform:uppercase}
  h1{font-size:82px;margin:24px 0 0;font-weight:700}
  .role{color:#9B5CFF;font-size:26px;margin-top:16px}
  .stack{color:#8B949E;font-size:22px;margin-top:56px;letter-spacing:.2em}
</style></head>
<body>
  <div class="tag">System online</div>
  <h1>WILLEM KRUGER</h1>
  <div class="role">Graduate Software Engineer &middot; Backend / .NET</div>
  <div class="stack">C# &nbsp; .NET &nbsp; TYPESCRIPT &nbsp; REACT &nbsp; AZURE</div>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html, { waitUntil: "networkidle" });
await page.screenshot({ path: "public/images/og.png" });
await browser.close();
console.log("wrote public/images/og.png");
