import type { Metadata } from "next";
import { serverSupabase } from "@/lib/api/supabase";
import { isUuid } from "@/lib/api/rows";
import { LocalizedText } from "@/lib/types/i18n";
import EventDetail from "./EventDetail";

// Link previews (WeChat, iMessage, WhatsApp…) read these tags from the HTML,
// so they're built on the server from the public event data.
export async function generateMetadata({ params }: PageProps<"/events/[id]">): Promise<Metadata> {
  const { id } = await params;
  const client = serverSupabase();
  if (!client || !isUuid(id)) return {};

  const { data } = await client
    .from("events")
    .select("title, description, poster_url")
    .eq("id", id)
    .maybeSingle();
  if (!data) return {};

  const event = data as { title: LocalizedText; description: LocalizedText; poster_url: string };
  const title = `${event.title.en} · The Hearth London`;
  return {
    title,
    description: event.description.en,
    openGraph: {
      title,
      description: event.description.en,
      images: [event.poster_url],
      type: "website",
    },
  };
}

export default async function EventDetailPage({ params }: PageProps<"/events/[id]">) {
  const { id } = await params;
  return <EventDetail id={id} />;
}
