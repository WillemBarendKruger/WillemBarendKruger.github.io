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
    // jsdom's cssstyle -> @asamuzakjp/css-color chain ships ESM-only
    // @csstools packages. Node's require(esm) support needs this flag on
    // versions below 20.19 (see this repo's dev Node: v20.17.0) or worker
    // startup fails with ERR_REQUIRE_ESM.
    execArgv: ["--experimental-require-module"],
  },
});
