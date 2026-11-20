import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "What's on in London",
  description:
    "Upcoming events from The Hearth London: reading groups, cultural exchange salons, philosophy discussions, psychology circles and more, with date, venue, price and places left.",
  alternates: { canonical: "/events/" },
};

export default function EventsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
