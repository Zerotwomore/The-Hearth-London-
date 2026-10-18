import { LocalizedText } from "@/lib/types/i18n";
import { Profile } from "@/lib/types/user";

export interface EventCategory {
  id: string;
  label: LocalizedText;
}

export interface EventItem {
  id: string;
  title: LocalizedText;
  categoryId: string;
  posterUrl: string;
  gallery: string[];
  startsAt: string;
  endsAt?: string;
  location: { name: LocalizedText; area: LocalizedText };
  hostId: string;
  capacity: number;
  description: LocalizedText;
  highlights: LocalizedText[];
  /** What to show, e.g. "£20 per person", "£6 table fee" or "Free". Paid at the event. */
  price: LocalizedText;
  /** 0 when there is nothing to pay. */
  pricePence: number;
  /**
   * People attending (the host is not included). Empty when signed out —
   * attendee lists are only visible to members.
   */
  attendees: Profile[];
}

export interface EventDetailItem extends EventItem {
  /** Missing when signed out: profiles are only visible to members. */
  host?: Profile;
}
