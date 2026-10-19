// Database row shapes, and how they map to the app's types.
// Column names follow supabase/migrations; keep the two in step.

import { LocalizedText } from "@/lib/types/i18n";
import { Profile } from "@/lib/types/user";
import { EventItem, EventStatus } from "@/lib/types/event";
import { publicStorageUrl } from "@/lib/api/supabase";

/** Columns needed to show someone: name, avatar, badge. */
export const PROFILE_FIELDS = "id, name, name_zh, avatar_path, bio, verified";

export interface ProfileRow {
  id: string;
  name: string;
  name_zh: string | null;
  avatar_path: string | null;
  bio: string | null;
  verified: boolean;
}

export function avatarUrl(path: string | null | undefined): string | undefined {
  return path ? publicStorageUrl("avatars", path) : undefined;
}

export function toProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    name: row.name,
    nameZh: row.name_zh ?? undefined,
    avatarUrl: avatarUrl(row.avatar_path),
    bio: row.bio ?? undefined,
    verified: row.verified,
  };
}

/** Embedded profiles come back null when the row exists but isn't visible. */
export function toProfiles(rows: { profiles: ProfileRow | null }[] | null): Profile[] {
  return (rows ?? []).flatMap((row) => (row.profiles ? [toProfile(row.profiles)] : []));
}

// Events ---------------------------------------------------------------------

/**
 * Staff events store a full poster URL; member-hosted events store a path in
 * the public "event-media" bucket (<host_id>/<file>).
 */
export function posterSrc(posterUrl: string): string {
  return /^https?:\/\//.test(posterUrl) ? posterUrl : publicStorageUrl("event-media", posterUrl);
}

const PUBLIC_EVENT_FIELDS = `
  id, title, category_id, poster_url, gallery_urls, starts_at, ends_at,
  location_name, location_area, host_id, capacity, description, highlights,
  price_pence, price_label, status, review_note
`;

/**
 * Columns to load for an event. Attendees and profiles are members-only: the
 * database refuses the whole query if a signed-out visitor asks for them.
 */
export function eventFields(signedIn: boolean): string {
  return signedIn
    ? `${PUBLIC_EVENT_FIELDS}, event_attendees ( joined_at, profiles ( ${PROFILE_FIELDS} ) )`
    : PUBLIC_EVENT_FIELDS;
}

export interface EventRow {
  id: string;
  title: LocalizedText;
  category_id: string;
  poster_url: string;
  gallery_urls: string[];
  starts_at: string;
  ends_at: string | null;
  location_name: LocalizedText;
  location_area: LocalizedText;
  host_id: string;
  capacity: number;
  description: LocalizedText;
  highlights: LocalizedText[];
  price_pence: number;
  price_label: LocalizedText | null;
  status: EventStatus;
  review_note: string | null;
  /** Absent when loaded signed out. */
  event_attendees?: { joined_at: string; profiles: ProfileRow | null }[] | null;
}

function formatPounds(pence: number): string {
  const pounds = pence / 100;
  return Number.isInteger(pounds) ? String(pounds) : pounds.toFixed(2);
}

export function priceText(pence: number, label: LocalizedText | null): LocalizedText {
  if (label) return label;
  if (pence === 0) return { en: "Free", zh: "免费" };
  const amount = formatPounds(pence);
  return { en: `£${amount} per person`, zh: `£${amount}/人` };
}

export function toEvent(row: EventRow): EventItem {
  const attendees = [...(row.event_attendees ?? [])].sort((a, b) =>
    a.joined_at.localeCompare(b.joined_at)
  );
  return {
    id: row.id,
    title: row.title,
    categoryId: row.category_id,
    posterUrl: posterSrc(row.poster_url),
    gallery: row.gallery_urls ?? [],
    startsAt: row.starts_at,
    endsAt: row.ends_at ?? undefined,
    location: { name: row.location_name, area: row.location_area },
    hostId: row.host_id,
    capacity: row.capacity,
    description: row.description,
    highlights: row.highlights ?? [],
    price: priceText(row.price_pence, row.price_label),
    pricePence: row.price_pence,
    attendees: toProfiles(attendees),
    status: row.status,
    reviewNote: row.review_note ?? undefined,
  };
}

/** Postgres rejects malformed uuids with an error; treat those as "not found". */
export function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}
