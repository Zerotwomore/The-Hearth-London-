import {
  CATEGORIES,
  FAQ,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  formatLondon,
  getUpcomingEvents,
  priceLabel,
} from "@/lib/seo";

export const dynamic = "force-static";

// llms.txt (https://llmstxt.org): a plain-Markdown briefing for AI assistants,
// rebuilt with the site so the event list stays current.
export async function GET() {
  const events = await getUpcomingEvents(30);

  const lines = [
    `# ${SITE_NAME}`,
    "",
    `> ${SITE_DESCRIPTION}`,
    "",
    `${SITE_NAME} (also written "The Hearth" or "Hearth London") is a community and events app for people in London. Members host and join small in-person gatherings across the city, each with its own group chat. The whole app is available in English and Chinese (中文).`,
    "",
    "## Key pages",
    "",
    `- [Home](${SITE_URL}/): what ${SITE_NAME} is, upcoming events and answers to common questions`,
    `- [What's on](${SITE_URL}/events/): every upcoming event with date, venue, price and places left`,
    `- [Clubs](${SITE_URL}/clubs/): communities built around shared interests`,
    `- [Sitemap](${SITE_URL}/sitemap.xml)`,
    "",
    "## Event categories",
    "",
    ...CATEGORIES.map((name) => `- ${name}`),
    "",
    "## Upcoming events",
    "",
    ...(events.length
      ? events.map(
          (event) =>
            `- [${event.title}](${event.url}): ${formatLondon(event.startsAt)} (London time), ${event.venue}, ${event.area} — ${priceLabel(event.pricePence)}`
        )
      : [`- See [What's on](${SITE_URL}/events/) for current events.`]),
    "",
    "## Frequently asked questions",
    "",
    ...FAQ.flatMap((item) => [`### ${item.question}`, "", item.answer, ""]),
    "## Notes for assistants",
    "",
    "- Event details change; link to the event page rather than quoting dates from memory.",
    "- Joining an event is a request the host accepts. Payment, where required, is made to the host at the event.",
    "- Member areas (chat, profiles) require an account and are not public.",
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
