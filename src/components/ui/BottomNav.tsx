"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAppState } from "@/lib/context/AppStateContext";
import { CONVERSATIONS } from "@/lib/data/conversations";
import { StringKey } from "@/lib/i18n/strings";
import { ReactNode } from "react";

const TABS: { href: string; key: StringKey; icon: ReactNode }[] = [
  {
    href: "/events",
    key: "navEvents",
    icon: (
      <path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
    ),
  },
  {
    href: "/clubs",
    key: "navClubs",
    icon: (
      <>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
  },
  {
    href: "/chat",
    key: "navChat",
    icon: (
      <path d="M21 11.5a8.38 8.38 0 0 1-9 8.34 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.2A8.38 8.38 0 0 1 4 11.5a8.5 8.5 0 0 1 17 0z" />
    ),
  },
  {
    href: "/profile",
    key: "navProfile",
    icon: (
      <>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </>
    ),
  },
];

export function BottomNav() {
  const pathname = usePathname();
  const { t, getUnreadCount } = useAppState();

  const unreadTotal = CONVERSATIONS.reduce(
    (total, conversation) => total + getUnreadCount(conversation.id),
    0
  );

  return (
    <nav className="sticky bottom-0 z-20 border-t border-hearth-ink/10 bg-hearth-cream/95 backdrop-blur">
      <ul className="flex items-stretch">
        {TABS.map((tab) => {
          const active = pathname.startsWith(tab.href);
          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                  active ? "text-hearth-ember" : "text-hearth-charcoal-soft"
                )}
              >
                <span className="relative">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={active ? 2.2 : 1.7}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {tab.icon}
                  </svg>
                  {tab.href === "/chat" && unreadTotal > 0 && (
                    <span
                      aria-label={`${unreadTotal} unread`}
                      className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-pill bg-hearth-ember px-1 text-[10px] font-semibold text-hearth-paper"
                    >
                      {unreadTotal}
                    </span>
                  )}
                </span>
                {t(tab.key)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
