import { LocalizedText } from "@/lib/types/i18n";

export interface Message {
  id: string;
  senderId: string;
  /**
   * Written in whatever language the sender used — messages are never
   * translated by the EN / 中文 toggle.
   */
  text: string;
  sentAt: string;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  messages: Message[];
  /** Set when this thread is the group chat for an event. */
  eventId?: string;
  /** Overrides the derived title; falls back to the event or other participant. */
  title?: LocalizedText;
  /** Messages waiting to be read; cleared once the thread is opened. */
  unreadCount?: number;
}

export function isGroupConversation(conversation: Conversation): boolean {
  return Boolean(conversation.eventId) || conversation.participantIds.length > 2;
}
