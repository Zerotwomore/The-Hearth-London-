import { LocalizedText } from "@/lib/types/i18n";

export type EventCategory =
  | "art-culture"
  | "reading"
  | "dinner"
  | "outdoors"
  | "bar"
  | "board-games"
  | "live-event";

export interface EventItem {
  id: string;
  title: LocalizedText;
  category: EventCategory;
  posterUrl: string;
  gallery?: string[];
  dateTime: string;
  endTime?: string;
  location: { name: LocalizedText; area: LocalizedText };
  hostId: string;
  attendeeIds: string[];
  capacity: number;
  description: LocalizedText;
  highlights: LocalizedText[];
  price: LocalizedText;
}
