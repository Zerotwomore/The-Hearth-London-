import { LocalizedText } from "@/lib/types/i18n";
import { Profile } from "@/lib/types/user";

export interface EventCategory {
  id: string;
  label: LocalizedText;
}

export interface EventItem {
  id: string;
  /** Posted content, as the host wrote it — not translated (see `original`). */
  title: string;
  categoryId: string;
  posterUrl: string;
  gallery: string[];
  startsAt: string;
  endsAt?: string;
  location: { name: string; area: string };
  hostId: string;
  capacity: number;
  description: string;
  highlights: string[];
  /**
   * What to show, e.g. "£20 per person", "£6 table fee" or "Free". Paid at
   * the event. Localized when generated from the amount; a host's own label
   * reads the same in both languages.
   */
  price: LocalizedText;
  /** 0 when there is nothing to pay. */
  pricePence: number;
  /**
   * People attending (the host is not included). Empty when signed out —
   * attendee lists are only visible to members.
   */
  attendees: Profile[];
  /**
   * Events hosted by members wait for an admin's approval. Only the host and
   * admins ever see events that aren't approved — except cancelled ones,
   * which their attendees still see.
   */
  status: EventStatus;
  /** An admin's note to the host, e.g. why the event was rejected. */
  reviewNote?: string;
}

export type EventStatus = "pending" | "approved" | "rejected" | "cancelled";

/** What a member fills in to host an event. */
export interface NewEvent {
  title: string;
  categoryId: string;
  poster: File;
  startsAt: Date;
  endsAt?: Date;
  locationName: string;
  locationArea: string;
  capacity: number;
  description: string;
  pricePence: number;
}

export interface EventDetailItem extends EventItem {
  /** Missing when signed out: profiles are only visible to members. */
  host?: Profile;
}

/** A member's own request to join: waiting on the host, or turned down. */
export type JoinRequestStatus = "pending" | "declined";

/** Someone who asked to join, as the host sees them. */
export interface JoinRequest {
  person: Profile;
  status: JoinRequestStatus;
  requestedAt: string;
}
