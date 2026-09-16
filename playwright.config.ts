import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  reporter: "list",
  use: { baseURL: "http://127.0.0.1:4310", trace: "on-first-retry" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // Serves the real static export, so the tests exercise what actually ships.
  // Port 3000 is avoided: on this machine Docker Desktop/WSL port-forwarding
  // already occupies it with an unrelated dev server, and
  // reuseExistingServer would silently attach to that instead of `out/`.
  webServer: {
    command: "npx serve out -l 4310",
    url: "http://127.0.0.1:4310",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
