import { LocalizedText } from "@/lib/types/i18n";
import { Profile } from "@/lib/types/user";

export interface Message {
  id: string;
  /** Null when the sender has deleted their account. */
  senderId: string | null;
  sender?: Profile;
  /**
   * Written in whatever language the sender used — messages are never
   * translated by the EN / 中文 toggle. Null for a photo-only message.
   */
  body: string | null;
  hasImage: boolean;
  sentAt: string;
}

/** One row of the chat tab: an event group chat the member belongs to. */
export interface ConversationSummary {
  id: string;
  eventId: string;
  title: LocalizedText;
  posterUrl: string;
  startsAt: string;
  /** False once the chat has gone read-only, a week after the event. */
  isOpen: boolean;
  lastMessageAt?: string;
  lastMessageBody?: string | null;
  lastMessageHasImage: boolean;
  lastSenderId?: string | null;
  /** Capped at 100 by the database. */
  unreadCount: number;
}
