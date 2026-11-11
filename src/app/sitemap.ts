import type { MetadataRoute } from "next";
import { SITE_URL, getUpcomingEvents } from "@/lib/seo";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const events = await getUpcomingEvents(100);
  return [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/events/`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/clubs/`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    ...events.map((event) => ({
      url: event.url,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.6,
    })),
  ];
}
