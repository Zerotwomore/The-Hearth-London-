"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/api/supabase";
import { PROFILE_FIELDS, ProfileRow, isUuid, toProfile } from "@/lib/api/rows";
import { useAppState } from "@/lib/context/AppStateContext";
import { ConversationSummary, Message } from "@/lib/types/chat";
import { LocalizedText } from "@/lib/types/i18n";

/** How much history a thread loads. */
const MESSAGE_LIMIT = 200;

/** Matches the database: chats go read-only a week after the event. */
const CHAT_OPEN_FOR_MS = 7 * 24 * 60 * 60 * 1000;

interface ConversationSummaryRow {
  conversation_id: string;
  event_id: string;
  title: LocalizedText;
  poster_url: string;
  starts_at: string;
  is_open: boolean;
  last_message_at: string | null;
  last_message_body: string | null;
  last_message_has_image: boolean;
  last_sender_id: string | null;
  unread_count: number;
}

/** The chat tab: every event chat the member is in, most recent activity first. */
export function useMyConversations() {
  const { userId } = useAppState();
  return useQuery({
    queryKey: ["conversations", userId],
    enabled: Boolean(userId),
    queryFn: async (): Promise<ConversationSummary[]> => {
      const { data, error } = await supabase().rpc("my_conversations");
      if (error) throw error;
      return (data as ConversationSummaryRow[]).map((row) => ({
        id: row.conversation_id,
        eventId: row.event_id,
        title: row.title,
        posterUrl: row.poster_url,
        startsAt: row.starts_at,
        isOpen: row.is_open,
        lastMessageAt: row.last_message_at ?? undefined,
        lastMessageBody: row.last_message_body,
        lastMessageHasImage: row.last_message_has_image,
        lastSenderId: row.last_sender_id,
        unreadCount: row.unread_count,
      }));
    },
  });
}

export interface ConversationDetail {
  id: string;
  event: {
    id: string;
    title: LocalizedText;
    posterUrl: string;
    location: { name: LocalizedText; area: LocalizedText };
    startsAt: string;
    endsAt?: string;
  };
  /** Host plus attendees. */
  memberCount: number;
  /** False once the chat has gone read-only, a week after the event. */
  isOpen: boolean;
}

interface ConversationRow {
  id: string;
  events: {
    id: string;
    title: LocalizedText;
    poster_url: string;
    location_name: LocalizedText;
    location_area: LocalizedText;
    starts_at: string;
    ends_at: string | null;
    event_attendees: { count: number }[];
  } | null;
}

/** A chat the member can see, or null (not found, or not a member). */
export function useConversation(id: string) {
  const { userId } = useAppState();
  return useQuery({
    queryKey: ["conversation", id, userId],
    enabled: Boolean(userId),
    queryFn: async (): Promise<ConversationDetail | null> => {
      if (!isUuid(id)) return null;
      const { data, error } = await supabase()
        .from("conversations")
        .select(
          `id, events ( id, title, poster_url, location_name, location_area,
             starts_at, ends_at, event_attendees ( count ) )`
        )
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      const row = data as unknown as ConversationRow | null;
      if (!row?.events) return null;
      const event = row.events;
      return {
        id: row.id,
        event: {
          id: event.id,
          title: event.title,
          posterUrl: event.poster_url,
          location: { name: event.location_name, area: event.location_area },
          startsAt: event.starts_at,
          endsAt: event.ends_at ?? undefined,
        },
        memberCount: (event.event_attendees[0]?.count ?? 0) + 1,
        isOpen:
          new Date(event.ends_at ?? event.starts_at).getTime() + CHAT_OPEN_FOR_MS > Date.now(),
      };
    },
  });
}

/** The group chat of an event, for its host and attendees. */
export function useEventConversationId(eventId: string, enabled: boolean) {
  const { userId } = useAppState();
  return useQuery({
    queryKey: ["event-conversation", eventId, userId],
    enabled: enabled && Boolean(userId),
    queryFn: async (): Promise<string | null> => {
      const { data, error } = await supabase()
        .from("conversations")
        .select("id")
        .eq("event_id", eventId)
        .maybeSingle();
      if (error) throw error;
      return (data?.id as string | undefined) ?? null;
    },
  });
}

interface MessageRow {
  id: string;
  sender_id: string | null;
  body: string | null;
  image_path: string | null;
  created_at: string;
  profiles: ProfileRow | null;
}

/** The latest messages of a chat, oldest first. */
export function useMessages(conversationId: string) {
  const { userId } = useAppState();
  return useQuery({
    queryKey: ["messages", conversationId, userId],
    enabled: Boolean(userId) && isUuid(conversationId),
    queryFn: async (): Promise<Message[]> => {
      const { data, error } = await supabase()
        .from("messages")
        .select(`id, sender_id, body, image_path, created_at, profiles ( ${PROFILE_FIELDS} )`)
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: false })
        .limit(MESSAGE_LIMIT);
      if (error) throw error;
      return (data as unknown as MessageRow[]).reverse().map((row) => ({
        id: row.id,
        senderId: row.sender_id,
        sender: row.profiles ? toProfile(row.profiles) : undefined,
        body: row.body,
        hasImage: row.image_path !== null,
        sentAt: row.created_at,
      }));
    },
  });
}

export function useSendMessage(conversationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: string) => {
      const { error } = await supabase()
        .from("messages")
        .insert({ conversation_id: conversationId, body });
      if (error) throw error;
    },
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["messages", conversationId] }),
        queryClient.invalidateQueries({ queryKey: ["conversations"] }),
      ]),
  });
}

export function useMarkConversationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (conversationId: string) => {
      const { error } = await supabase().rpc("mark_conversation_read", {
        p_conversation_id: conversationId,
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["conversations"] }),
  });
}

/**
 * Listens for new messages in every chat the member belongs to (the
 * database only sends rows the member may read) and refreshes the chat list
 * and any open thread. Mounted once, for signed-in members.
 */
export function useChatRealtime() {
  const { userId } = useAppState();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;
    const channel = supabase()
      .channel(`messages:${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const conversationId = (payload.new as { conversation_id?: string }).conversation_id;
          queryClient.invalidateQueries({ queryKey: ["conversations"] });
          if (conversationId) {
            queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
          }
        }
      )
      .subscribe();
    return () => {
      supabase().removeChannel(channel);
    };
  }, [userId, queryClient]);
}
