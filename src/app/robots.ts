import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-static";

// Search engines and AI assistants are welcome on the public pages. The
// member-only areas are pointless to crawl (they need a login).
const PRIVATE = [
  "/chat/",
  "/profile/",
  "/login/",
  "/signup/",
  "/onboarding/",
  "/forgot-password/",
  "/reset-password/",
  "/events/new/",
  "/events/edit/",
  "/events/review/",
];

// Crawlers that fetch pages to answer questions or train models. Named
// explicitly so the intent is clear and easy to change per bot.
const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: PRIVATE },
      { userAgent: AI_CRAWLERS, allow: "/", disallow: PRIVATE },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
