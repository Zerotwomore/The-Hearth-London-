// Everything search engines and AI assistants read about the site: the
// canonical address, the facts we state about it, and the upcoming events.
// Used at build time by the home page, sitemap, robots.txt and llms.txt.
//
// The site is a static export, so the event list is fetched when it's built
// (and rebuilt daily — see .github/workflows/deploy.yml).

import { createClient } from "@supabase/supabase-js";
import { posterSrc } from "@/lib/api/rows";
import { LocalizedText } from "@/lib/types/i18n";

export const SITE_URL = "https://thehearthlondon.com";
export const SITE_NAME = "The Hearth London";

export const SITE_TITLE = "The Hearth London — meet people in London through events & clubs";
export const SITE_DESCRIPTION =
  "The Hearth London is a bilingual (English / 中文) community for people making London home. Join gallery tours, reading groups, supper clubs, walks, board games and more — and chat with the group before you go.";

/** What the platform offers, in the categories the app uses. */
export const CATEGORIES = [
  "Art & Culture",
  "Reading groups",
  "Dinners and supper clubs",
  "Outdoors and walks",
  "Bars",
  "Board games",
  "Live events",
];

/** Answers are written to be quoted on their own, so each names the site. */
export const FAQ: { question: string; answer: string }[] = [
  {
    question: "What is The Hearth London?",
    answer:
      "The Hearth London is a bilingual (English and Chinese) community and events app for people making London home. Members meet through small in-person gatherings such as gallery tours, reading groups, supper clubs, long walks and board game nights, and join clubs around shared interests.",
  },
  {
    question: "What kinds of events does The Hearth London run?",
    answer: `Events on The Hearth London fall into these categories: ${CATEGORIES.join(", ")}. Each event shows its date, time, venue, area of London, number of places and price before you join.`,
  },
  {
    question: "How do I join an event on The Hearth London?",
    answer:
      "Create an account, open an event and ask to join. The host reviews your request and, once accepted, you are added to the attendee list and the event's group chat so you can say hello before you meet.",
  },
  {
    question: "How much do events cost?",
    answer:
      "Every event shows its price up front, and many are free. Where there is a charge, such as a table fee or a per-person cost, you pay the host at the event rather than through the app.",
  },
  {
    question: "Can I host my own event on The Hearth London?",
    answer:
      "Yes. Members can host events from the app by adding a poster, date, venue and description. Events from members are checked by the Hearth team before they go live, and hosts can edit or cancel them afterwards.",
  },
  {
    question: "Is The Hearth London available in Chinese?",
    answer:
      "Yes. The Hearth London is fully bilingual — the whole app can be switched between English and 中文 at any time.",
  },
];

export interface SeoEvent {
  id: string;
  title: string;
  description: string;
  startsAt: string;
  endsAt?: string;
  venue: string;
  area: string;
  pricePence: number;
  image: string;
  url: string;
}

/** Markdown from the description editor, as plain text. */
export function plainText(markdown: string): string {
  return markdown
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_`>#]/g, "")
    .replace(/^- /gm, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function eventUrl(id: string): string {
  return `${SITE_URL}/events/view/?id=${encodeURIComponent(id)}`;
}

/** Approved events that haven't started, soonest first. Empty if the database can't be reached. */
export async function getUpcomingEvents(limit = 12): Promise<SeoEvent[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return [];
  try {
    const supabase = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await supabase
      .from("events")
      .select(
        "id, title, description, starts_at, ends_at, location_name, location_area, price_pence, poster_url"
      )
      .eq("status", "approved")
      .gt("starts_at", new Date().toISOString())
      .order("starts_at")
      .limit(limit);
    if (error || !data) return [];
    return (
      data as {
        id: string;
        title: LocalizedText;
        description: LocalizedText;
        starts_at: string;
        ends_at: string | null;
        location_name: LocalizedText;
        location_area: LocalizedText;
        price_pence: number;
        poster_url: string;
      }[]
    ).map((row) => ({
      id: row.id,
      title: row.title.en,
      description: plainText(row.description.en),
      startsAt: row.starts_at,
      endsAt: row.ends_at ?? undefined,
      venue: row.location_name.en,
      area: row.location_area.en,
      pricePence: row.price_pence,
      image: posterSrc(row.poster_url),
      url: eventUrl(row.id),
    }));
  } catch {
    return [];
  }
}

/** "Sat 14 Nov, 19:00" in London time, wherever the build runs. */
export function formatLondon(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

export function priceLabel(pence: number): string {
  if (pence === 0) return "Free";
  const pounds = pence / 100;
  return `£${Number.isInteger(pounds) ? pounds : pounds.toFixed(2)} per person`;
}

/** schema.org graph for the home page: the organisation, the site, its events and FAQ. */
export function homeJsonLd(events: SeoEvent[]) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        alternateName: ["The Hearth", "Hearth London"],
        url: SITE_URL,
        description: SITE_DESCRIPTION,
        areaServed: { "@type": "City", name: "London" },
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        alternateName: ["The Hearth", "Hearth London"],
        inLanguage: ["en-GB", "zh-CN"],
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
      {
        "@type": "FAQPage",
        mainEntity: FAQ.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
      },
      ...events.map((event) => ({
        "@type": "Event",
        name: event.title,
        description: event.description,
        startDate: event.startsAt,
        ...(event.endsAt && { endDate: event.endsAt }),
        eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        location: {
          "@type": "Place",
          name: event.venue,
          address: {
            "@type": "PostalAddress",
            addressLocality: event.area,
            addressRegion: "London",
            addressCountry: "GB",
          },
        },
        image: event.image,
        url: event.url,
        organizer: { "@id": `${SITE_URL}/#organization` },
        offers: {
          "@type": "Offer",
          url: event.url,
          price: (event.pricePence / 100).toFixed(2),
          priceCurrency: "GBP",
          availability: "https://schema.org/InStock",
        },
      })),
    ],
  };
}
