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
import { EventCategory, EventDetailItem, EventItem } from "@/lib/types/event";
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
