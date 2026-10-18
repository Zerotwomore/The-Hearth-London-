"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  useConversation,
  useMarkConversationRead,
  useMessages,
  useSendMessage,
} from "@/lib/api/chat";
import { errorKey } from "@/lib/api/errors";
import { useAppState } from "@/lib/context/AppStateContext";
import { cn, displayName, formatMessageTime } from "@/lib/utils";
import { eventHref } from "@/lib/routes";
import { TopBar } from "@/components/ui/TopBar";
import { Avatar } from "@/components/ui/Avatar";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { SignInPrompt } from "@/components/auth/SignInPrompt";
import { ErrorState, LoadingState, StatusMessage } from "@/components/ui/StatusMessage";

export default function Conversation({ id }: { id: string }) {
  const { tx, t, lang, userId, authReady } = useAppState();
  const conversationQuery = useConversation(id);
  const messagesQuery = useMessages(id);
  const send = useSendMessage(id);
  const { mutate: markRead } = useMarkConversationRead();
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const conversation = conversationQuery.data;
  const messages = messagesQuery.data;
  const latestMessageId = messages?.at(-1)?.id;

  // Mark read on opening, and again whenever a new message arrives while open.
  useEffect(() => {
    if (conversation) markRead(conversation.id);
  }, [conversation, latestMessageId, markRead]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [latestMessageId]);

  if (!authReady || (userId && conversationQuery.isPending)) {
    return (
      <>
        <TopBar title={t("chatTitle")} backHref="/chat" />
        <LoadingState />
      </>
    );
  }
  if (!userId) {
    return (
      <>
        <TopBar title={t("chatTitle")} backHref="/chat" />
        <SignInPrompt message="logInForChat" />
      </>
    );
  }
  if (!conversation) {
    return (
      <>
        <TopBar title={t("chatTitle")} backHref="/chat" />
        {conversationQuery.isError ? (
          <ErrorState onRetry={() => conversationQuery.refetch()} />
        ) : (
          <StatusMessage>{t("chatNotFound")}</StatusMessage>
        )}
      </>
    );
  }

  const { event, isOpen } = conversation;

  function handleSend() {
    const text = draft.trim();
    if (!text || send.isPending) return;
    send.mutate(text, { onSuccess: () => setDraft("") });
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <TopBar
        title={tx(event.title)}
        subtitle={`${conversation.memberCount} ${t("groupMembers")}`}
        backHref="/chat"
        action={
          <Link
            href={eventHref(event.id)}
            className="h-9 w-9 shrink-0 overflow-hidden rounded-[5px] border-2 border-hearth-gold"
            aria-label={t("viewEvent")}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={event.posterUrl} alt="" className="h-full w-full object-cover" />
          </Link>
        }
      />

      <Link
        href={eventHref(event.id)}
        className="flex items-center justify-between gap-3 border-b border-hearth-ink/10 bg-hearth-cream-dark/50 px-5 py-2.5 hover:bg-hearth-cream-dark"
      >
        <span className="min-w-0 truncate text-[13px] text-hearth-charcoal">
          {tx(event.location.name)} · {tx(event.location.area)}
        </span>
        <span className="shrink-0 text-[12px] font-medium text-hearth-ember">
          {t("viewEvent")} →
        </span>
      </Link>

      <div className="flex-1 space-y-3 px-5 py-5">
        {messagesQuery.isPending ? (
          <LoadingState />
        ) : messagesQuery.isError ? (
          <ErrorState onRetry={() => messagesQuery.refetch()} />
        ) : messages && messages.length === 0 ? (
          <StatusMessage>{t("noMessages")}</StatusMessage>
        ) : (
          messages?.map((message, index) => {
            const own = message.senderId === userId;
            const sender = message.sender;
            const previous = messages[index - 1];
            const showSender = !own && previous?.senderId !== message.senderId;
            const senderName = sender
              ? displayName(sender, lang, { short: true })
              : t("formerMember");

            return (
              <div
                key={message.id}
                className={cn("flex gap-2", own ? "justify-end" : "justify-start")}
              >
                {!own && (
                  <span className="w-8 shrink-0 self-end">
                    {showSender && (
                      <Avatar name={senderName} src={sender?.avatarUrl} size="xs" />
                    )}
                  </span>
                )}

                <div className="max-w-[76%]">
                  {showSender && (
                    <p className="mb-1 flex items-center gap-1 pl-1 text-[11px] font-medium text-hearth-charcoal-soft">
                      {senderName}
                      {sender?.verified && <VerifiedBadge />}
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
                    <p className="whitespace-pre-line break-words text-[15px] leading-relaxed">
                      {message.body ?? `[${t("photo")}]`}
                    </p>
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
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div className="sticky bottom-0 border-t border-hearth-ink/10 bg-hearth-cream/95 px-4 py-3 backdrop-blur">
        {isOpen ? (
          <>
            {send.error && (
              <p role="alert" className="mb-2 text-center text-[13px] text-hearth-ember">
                {t(errorKey(send.error))}
              </p>
            )}
            <div className="flex items-center gap-2">
              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") handleSend();
                }}
                maxLength={2000}
                placeholder={t("messagePlaceholder")}
                className="flex-1 rounded-pill border border-hearth-ink/12 bg-hearth-paper px-4 py-2.5 text-[15px] text-hearth-ink placeholder:text-hearth-charcoal-soft/70 focus:border-hearth-ember focus:outline-none"
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={!draft.trim() || send.isPending}
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
          </>
        ) : (
          <p className="py-1 text-center text-[13px] text-hearth-charcoal-soft">
            {t("chatClosed")}
          </p>
        )}
      </div>
    </div>
  );
}
