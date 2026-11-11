import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Clubs in London",
  description:
    "Find your people: clubs on The Hearth London bring Londoners together around shared interests, from reading to walking to board games.",
  alternates: { canonical: "/clubs/" },
};

export default function ClubsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
