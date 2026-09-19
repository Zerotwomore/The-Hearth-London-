import { EVENTS } from "@/lib/data/events";
import EventDetail from "./EventDetail";

export function generateStaticParams() {
  return EVENTS.map((event) => ({ id: event.id }));
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EventDetail id={id} />;
}
