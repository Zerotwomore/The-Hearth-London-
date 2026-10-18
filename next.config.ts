import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Images are compressed before upload (see lib/api/profile.ts), and Vercel
  // bills per optimised image, so serve them as they are.
  images: { unoptimized: true },
};

export default nextConfig;
