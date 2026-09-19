"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getConversationById,
  getOtherParticipantId,
} from "@/lib/data/conversations";
import { getUserById, CURRENT_USER_ID } from "@/lib/data/users";
import { getEventById } from "@/lib/data/events";
import { isGroupConversation } from "@/lib/types/chat";
import { useAppState } from "@/lib/context/AppStateContext";
import { formatMessageTime, cn } from "@/lib/utils";
import { TopBar } from "@/components/ui/TopBar";
import { Avatar } from "@/components/ui/Avatar";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";

export default function Conversation({ id }: { id: string }) {
  const conversation = getConversationById(id);
  const { tx, t, lang, getMessages, sendMessage, markConversationRead } =
    useAppState();
  const [draft, setDraft] = useState("");

  useEffect(() => {
    markConversationRead(id);
    // markConversationRead is stable per state update; keyed on the thread id.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!conversation) notFound();

  const messages = getMessages(conversation.id);
  const isGroup = isGroupConversation(conversation);
  const event = conversation.eventId
    ? getEventById(conversation.eventId)
    : undefined;
  const other = isGroup
    ? undefined
    : getUserById(getOtherParticipantId(conversation));

  const title = event
    ? tx(event.title)
    : ((lang === "zh" && other?.nameZh ? other.nameZh : other?.name) ?? "");

  function handleSend() {
    const text = draft.trim();
    if (!text) return;
    sendMessage(id, text);
    setDraft("");
  }

  function displayName(userId: string): string {
    const user = getUserById(userId);
    if (!user) return "";
    return lang === "zh" && user.nameZh ? user.nameZh : user.name.split(" ")[0];
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <TopBar
        title={title}
        subtitle={
          isGroup
            ? `${conversation.participantIds.length} ${t("groupMembers")}`
            : undefined
        }
        backHref="/chat"
        action={
          event ? (
            <Link
              href={`/events/${event.id}`}
              className="h-9 w-9 shrink-0 overflow-hidden rounded-[5px] border-2 border-hearth-gold"
              aria-label={t("viewEvent")}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={event.posterUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            </Link>
          ) : (
            other && <Avatar name={other.name} src={other.avatarUrl} size="sm" />
          )
        }
      />

      {event && (
        <Link
          href={`/events/${event.id}`}
          className="flex items-center justify-between gap-3 border-b border-hearth-ink/10 bg-hearth-cream-dark/50 px-5 py-2.5 hover:bg-hearth-cream-dark"
        >
          <span className="min-w-0 truncate text-[13px] text-hearth-charcoal">
            {tx(event.location.name)} · {tx(event.location.area)}
          </span>
          <span className="shrink-0 text-[12px] font-medium text-hearth-ember">
            {t("viewEvent")} →
          </span>
        </Link>
      )}

      <div className="flex-1 space-y-3 px-5 py-5">
        {messages.map((message, index) => {
          const own = message.senderId === CURRENT_USER_ID;
          const sender = getUserById(message.senderId);
          const previous = messages[index - 1];
          const showSender =
            isGroup && !own && previous?.senderId !== message.senderId;

          return (
            <div
              key={message.id}
              className={cn("flex gap-2", own ? "justify-end" : "justify-start")}
            >
              {isGroup && !own && (
                <span className="w-8 shrink-0 self-end">
                  {showSender && sender && (
                    <Avatar
                      name={sender.name}
                      src={sender.avatarUrl}
                      size="xs"
                    />
                  )}
                </span>
              )}

              <div className="max-w-[76%]">
                {showSender && sender && (
                  <p className="mb-1 flex items-center gap-1 pl-1 text-[11px] font-medium text-hearth-charcoal-soft">
                    {displayName(message.senderId)}
                    {sender.verified && <VerifiedBadge />}
                  </p>
                )}
                <div
                  className={cn(
                    "rounded-2xl px-3.5 py-2.5",
                    own
                      ? "rounded-br-md bg-hearth-ember text-hearth-paper"
                      : "rounded-bl-md border border-hearth-ink/8 bg-hearth-paper text-hearth-ink"
                  )}
                >
                  <p className="text-[15px] leading-relaxed">{message.text}</p>
                  <p
                    className={cn(
                      "mt-1 text-[10px]",
                      own ? "text-hearth-paper/70" : "text-hearth-charcoal-soft"
                    )}
                  >
                    {formatMessageTime(message.sentAt, lang)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="sticky bottom-0 border-t border-hearth-ink/10 bg-hearth-cream/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-2">
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") handleSend();
            }}
            placeholder={t("messagePlaceholder")}
            className="flex-1 rounded-pill border border-hearth-ink/12 bg-hearth-paper px-4 py-2.5 text-[15px] text-hearth-ink placeholder:text-hearth-charcoal-soft/70 focus:border-hearth-ember focus:outline-none"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!draft.trim()}
            aria-label={t("send")}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-hearth-ember text-hearth-paper transition-colors hover:bg-hearth-ember-light disabled:opacity-40"
          >
            <svg
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
