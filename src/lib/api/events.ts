"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/api/supabase";
import {
  EventRow,
  eventFields,
  PROFILE_FIELDS,
  ProfileRow,
  isUuid,
  toEvent,
  toProfile,
} from "@/lib/api/rows";
import { useAppState } from "@/lib/context/AppStateContext";
import { imageExtension, resizeImage } from "@/lib/api/images";
import { EventCategory, EventDetailItem, EventItem, NewEvent } from "@/lib/types/event";
import { LocalizedText } from "@/lib/types/i18n";

// Queries are keyed on the signed-in user: signed-out visitors see less
// (no attendee lists), so the data must be refetched when that changes.

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    staleTime: Infinity,
    queryFn: async (): Promise<EventCategory[]> => {
      const { data, error } = await supabase()
        .from("event_categories")
        .select("id, label")
        .order("sort");
      if (error) throw error;
      return (data as { id: string; label: LocalizedText }[]).map((row) => ({
        id: row.id,
        label: row.label,
      }));
    },
  });
}

/** Upcoming events, soonest first. */
export function useEvents() {
  const { userId } = useAppState();
  return useQuery({
    queryKey: ["events", userId],
    queryFn: async (): Promise<EventItem[]> => {
      const { data, error } = await supabase()
        .from("events")
        .select(eventFields(Boolean(userId)))
        .eq("status", "approved")
        .gte("starts_at", new Date().toISOString())
        .order("starts_at");
      if (error) throw error;
      return (data as unknown as EventRow[]).map(toEvent);
    },
  });
}

/** One event, or null if it doesn't exist. */
export function useEvent(id: string) {
  const { userId } = useAppState();
  return useQuery({
    queryKey: ["event", id, userId],
    queryFn: async (): Promise<EventDetailItem | null> => {
      if (!isUuid(id)) return null;
      const fields = userId
        ? `${eventFields(true)}, host:profiles!events_host_id_fkey ( ${PROFILE_FIELDS} )`
        : eventFields(false);
      const { data, error } = await supabase()
        .from("events")
        .select(fields)
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      const row = data as unknown as EventRow & { host?: ProfileRow | null };
      return { ...toEvent(row), host: row.host ? toProfile(row.host) : undefined };
    },
  });
}

/** The ids of events the signed-in member attends or hosts. */
export function useMyEventIds() {
  const { userId } = useAppState();
  return useQuery({
    queryKey: ["my-event-ids", userId],
    enabled: Boolean(userId),
    queryFn: async (): Promise<Set<string>> => {
      const [attending, hosting] = await Promise.all([
        supabase().from("event_attendees").select("event_id").eq("user_id", userId!),
        supabase().from("events").select("id").eq("host_id", userId!),
      ]);
      if (attending.error) throw attending.error;
      if (hosting.error) throw hosting.error;
      return new Set([
        ...attending.data.map((row) => row.event_id as string),
        ...hosting.data.map((row) => row.id as string),
      ]);
    },
  });
}

function useInvalidateEvents() {
  const queryClient = useQueryClient();
  return (eventId: string) =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ["events"] }),
      queryClient.invalidateQueries({ queryKey: ["event", eventId] }),
      queryClient.invalidateQueries({ queryKey: ["my-event-ids"] }),
      queryClient.invalidateQueries({ queryKey: ["conversations"] }),
    ]);
}

/**
 * Joins through the database's join_event(), which checks capacity and start
 * time. Errors carry codes such as "event_full" (see lib/api/errors).
 */
export function useJoinEvent() {
  const invalidate = useInvalidateEvents();
  return useMutation({
    mutationFn: async (eventId: string) => {
      const { error } = await supabase().rpc("join_event", { p_event_id: eventId });
      if (error) throw error;
    },
    onSettled: (_data, _error, eventId) => invalidate(eventId),
  });
}

export function useLeaveEvent() {
  const { userId } = useAppState();
  const invalidate = useInvalidateEvents();
  return useMutation({
    mutationFn: async (eventId: string) => {
      const { error } = await supabase()
        .from("event_attendees")
        .delete()
        .eq("event_id", eventId)
        .eq("user_id", userId!);
      if (error) throw error;
    },
    onSettled: (_data, _error, eventId) => invalidate(eventId),
  });
}

// Hosting ----------------------------------------------------------------------

/** Matches create_event(): pending or approved events that haven't ended yet. */
export const MAX_ACTIVE_EVENTS = 20;

/** Events the member hosts that haven't ended, in any review state, soonest first. */
export function useHostedEvents() {
  const { userId } = useAppState();
  return useQuery({
    queryKey: ["hosted-events", userId],
    enabled: Boolean(userId),
    queryFn: async (): Promise<EventItem[]> => {
      const now = new Date().toISOString();
      const { data, error } = await supabase()
        .from("events")
        .select(eventFields(true))
        .eq("host_id", userId!)
        .or(`ends_at.gt.${now},and(ends_at.is.null,starts_at.gt.${now})`)
        .order("starts_at");
      if (error) throw error;
      return (data as unknown as EventRow[]).map(toEvent);
    },
  });
}

/** For admins: events waiting for review, oldest submission first. */
export function usePendingEvents(enabled: boolean) {
  const { userId } = useAppState();
  return useQuery({
    queryKey: ["pending-events", userId],
    enabled: enabled && Boolean(userId),
    queryFn: async (): Promise<EventDetailItem[]> => {
      const { data, error } = await supabase()
        .from("events")
        .select(`${eventFields(true)}, host:profiles!events_host_id_fkey ( ${PROFILE_FIELDS} )`)
        .eq("status", "pending")
        .order("submitted_at");
      if (error) throw error;
      return (data as unknown as (EventRow & { host: ProfileRow | null })[]).map((row) => ({
        ...toEvent(row),
        host: row.host ? toProfile(row.host) : undefined,
      }));
    },
  });
}

const POSTER_WIDTH = 900;
const POSTER_HEIGHT = 1200;

/**
 * Uploads the poster (cropped to 3:4) to the host's folder, then submits the
 * event through create_event(), which enforces the active-event limit.
 * Resolves to the new event's id. Members' events start out pending.
 */
export function useCreateEvent() {
  const { userId } = useAppState();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (event: NewEvent): Promise<string> => {
      const blob = await resizeImage(event.poster, POSTER_WIDTH, POSTER_HEIGHT);
      const path = `${userId}/${Date.now()}.${imageExtension(blob)}`;
      const upload = await supabase()
        .storage.from("event-media")
        .upload(path, blob, { contentType: blob.type, upsert: false });
      if (upload.error) throw upload.error;

      const { data, error } = await supabase().rpc("create_event", {
        p_title: event.title,
        p_category_id: event.categoryId,
        p_poster_path: path,
        p_starts_at: event.startsAt.toISOString(),
        p_ends_at: event.endsAt?.toISOString() ?? null,
        p_location_name: event.locationName,
        p_location_area: event.locationArea,
        p_capacity: event.capacity,
        p_description: event.description,
        p_price_pence: event.pricePence,
      });
      if (error) throw error;
      return data as string;
    },
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["events"] }),
        queryClient.invalidateQueries({ queryKey: ["hosted-events"] }),
        queryClient.invalidateQueries({ queryKey: ["pending-events"] }),
        queryClient.invalidateQueries({ queryKey: ["my-event-ids"] }),
      ]),
  });
}

/** For admins: approve or reject a pending event, with an optional note to the host. */
export function useReviewEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (review: { eventId: string; approve: boolean; note?: string }) => {
      const { error } = await supabase().rpc("review_event", {
        p_event_id: review.eventId,
        p_approve: review.approve,
        p_note: review.note ?? null,
      });
      if (error) throw error;
    },
    onSettled: (_data, _error, review) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["events"] }),
        queryClient.invalidateQueries({ queryKey: ["event", review.eventId] }),
        queryClient.invalidateQueries({ queryKey: ["pending-events"] }),
      ]),
  });
}
