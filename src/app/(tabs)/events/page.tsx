"use client";

import { useMemo, useState } from "react";
import { TopBar } from "@/components/ui/TopBar";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { EventCard } from "@/components/events/EventCard";
import { EventFilterBar } from "@/components/events/EventFilterBar";
import { ErrorState, LoadingState, StatusMessage } from "@/components/ui/StatusMessage";
import { useEvents, useMyEventIds } from "@/lib/api/events";
import { useAppState } from "@/lib/context/AppStateContext";

export default function EventsPage() {
  const { t } = useAppState();
  const [category, setCategory] = useState<string | "all">("all");
  const [query, setQuery] = useState("");
  const eventsQuery = useEvents();
  const { data: myEventIds } = useMyEventIds();

  const events = useMemo(() => {
    return (eventsQuery.data ?? []).filter((event) => {
      const matchesCategory = category === "all" || event.categoryId === category;
      const haystack = `${event.title.en} ${event.title.zh} ${event.location.area.en} ${event.location.area.zh}`.toLowerCase();
      const matchesQuery = haystack.includes(query.trim().toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [eventsQuery.data, category, query]);

  return (
    <>
      <TopBar
        title={t("eventsTitle")}
        subtitle={t("eventsSubtitle")}
        large
        action={<LanguageToggle />}
      />

      <div className="px-5 pt-4 pb-24">
        <label className="relative mb-4 block">
          <span className="sr-only">{t("searchPlaceholder")}</span>
          <svg
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-hearth-charcoal-soft"
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("searchPlaceholder")}
            className="w-full rounded-pill border border-hearth-ink/12 bg-hearth-paper py-2.5 pl-10 pr-4 text-[15px] text-hearth-ink placeholder:text-hearth-charcoal-soft/70 focus:border-hearth-ember focus:outline-none"
          />
        </label>

        <EventFilterBar active={category} onChange={setCategory} />

        {eventsQuery.isPending ? (
          <LoadingState />
        ) : eventsQuery.isError ? (
          <ErrorState onRetry={() => eventsQuery.refetch()} />
        ) : eventsQuery.data.length === 0 ? (
          <StatusMessage>{t("noUpcomingEvents")}</StatusMessage>
        ) : events.length === 0 ? (
          <StatusMessage>{t("noEvents")}</StatusMessage>
        ) : (
          <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-7">
            {events.map((event) => (
              <EventCard key={event.id} event={event} joined={myEventIds?.has(event.id)} />
            ))}
          </div>
        )}

        <p className="mt-10 text-center text-[11px] uppercase tracking-[0.2em] text-hearth-charcoal-soft/60">
          {t("brandFull")}
        </p>
      </div>
    </>
  );
}
