"use client";

import Link from "next/link";
import { TopBar } from "@/components/ui/TopBar";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { SignInPrompt } from "@/components/auth/SignInPrompt";
import { ErrorState, LoadingState, StatusMessage } from "@/components/ui/StatusMessage";
import { useMyConversations } from "@/lib/api/chat";
import { useAppState } from "@/lib/context/AppStateContext";
import { formatMessageTime } from "@/lib/utils";

export default function ChatListPage() {
  const { t, tx, lang, userId, authReady } = useAppState();
  const conversations = useMyConversations();

  return (
    <>
      <TopBar title={t("chatTitle")} large action={<LanguageToggle />} />

      {!authReady ? (
        <LoadingState />
      ) : !userId ? (
        <SignInPrompt message="logInForChat" />
      ) : conversations.isPending ? (
        <LoadingState />
      ) : conversations.isError ? (
        <ErrorState onRetry={() => conversations.refetch()} />
      ) : conversations.data.length === 0 ? (
        <StatusMessage>{t("noChats")}</StatusMessage>
      ) : (
        <ul className="divide-y divide-hearth-ink/8 pb-24">
          {conversations.data.map((conversation) => {
            const unread = conversation.unreadCount;
            const senderPrefix =
              conversation.lastMessageAt && conversation.lastSenderId === userId
                ? `${t("you")}: `
                : "";
            const preview = conversation.lastMessageAt
              ? `${senderPrefix}${conversation.lastMessageBody ?? t("photo")}`
              : t("noMessages");

            return (
              <li key={conversation.id}>
                <Link
                  href={`/chat/${conversation.id}`}
                  className="flex items-center gap-3 px-5 py-4 transition-colors hover:bg-hearth-cream-dark/40"
                >
                  <span className="h-12 w-12 shrink-0 overflow-hidden rounded-[6px] border-2 border-hearth-gold bg-hearth-cream-dark">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={conversation.posterUrl} alt="" className="h-full w-full object-cover" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="truncate text-[15px] font-semibold text-hearth-ink">
                        {tx(conversation.title)}
                      </p>
                      {conversation.lastMessageAt && (
                        <span
                          className={
                            unread > 0
                              ? "shrink-0 text-[11px] font-semibold text-hearth-ember"
                              : "shrink-0 text-[11px] text-hearth-charcoal-soft"
                          }
                        >
                          {formatMessageTime(conversation.lastMessageAt, lang)}
                        </span>
                      )}
                    </div>

                    <p className="mt-0.5 text-[11px] uppercase tracking-widest text-hearth-gold">
                      {t("eventGroup")}
                    </p>

                    <div className="mt-0.5 flex items-center gap-2">
                      <p
                        className={
                          unread > 0
                            ? "min-w-0 flex-1 truncate text-[13px] font-medium text-hearth-ink"
                            : "min-w-0 flex-1 truncate text-[13px] text-hearth-charcoal-soft"
                        }
                      >
                        {preview}
                      </p>
                      {unread > 0 && (
                        <span
                          aria-label={`${unread} unread`}
                          className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-pill bg-hearth-ember px-1.5 text-[11px] font-semibold text-hearth-paper"
                        >
                          {unread >= 100 ? "99+" : unread}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
