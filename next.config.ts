import type { NextConfig } from "next";

/**
 * GitHub Pages serves the site from /<repo>/, so the build needs a base path.
 * Both are supplied by the deploy workflow; locally they are empty and the app
 * runs at the root as usual.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const isExport = process.env.NEXT_EXPORT === "true";

const nextConfig: NextConfig = {
  ...(isExport ? { output: "export" as const } : {}),
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
  images: { unoptimized: true },
  // Pages resolves /events/e1/ to an index.html inside that directory.
  trailingSlash: true,
};

export default nextConfig;
