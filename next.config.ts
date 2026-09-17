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
