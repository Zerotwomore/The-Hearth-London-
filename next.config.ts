import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Built as static files for GitHub Pages; all data loads in the browser
  // from Supabase. Pages serves /events/view/ from events/view/index.html.
  output: "export",
  trailingSlash: true,
  // Images are compressed before upload (see lib/api/profile.ts).
  images: { unoptimized: true },
};

export default nextConfig;
