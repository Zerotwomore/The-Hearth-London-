"use client";

import Link from "next/link";
import { EventItem, EventStatus } from "@/lib/types/event";
import { eventHref } from "@/lib/routes";
import { useAppState } from "@/lib/context/AppStateContext";
import { useCategories } from "@/lib/api/events";
import { cn, formatEventDateTime, hasEnded } from "@/lib/utils";
import { StringKey } from "@/lib/i18n/strings";
import { AttendeeAvatarStack } from "@/components/events/AttendeeAvatarStack";

/** Labels for events that aren't simply listed. */
const STATUS_BADGE: Record<Exclude<EventStatus, "approved">, { label: StringKey; className: string }> = {
  pending: { label: "statusPending", className: "bg-hearth-gold" },
  rejected: { label: "statusRejected", className: "bg-hearth-ember" },
  cancelled: { label: "statusCancelled", className: "bg-hearth-ink" },
};

export function EventCard({ event, joined = false }: { event: EventItem; joined?: boolean }) {
  const { tx, t, lang } = useAppState();
  const { data: categories } = useCategories();
  const category = categories?.find((item) => item.id === event.categoryId);
  const ended = hasEnded(event);

  return (
    <Link href={eventHref(event.id)} className="group block">
      <article className="flex flex-col">
        <div className="relative aspect-[3/4] overflow-hidden rounded-[6px] frame bg-hearth-cream-dark">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={event.posterUrl}
            alt={tx(event.title)}
            className={cn(
              "h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]",
              (event.status === "cancelled" || ended) && "opacity-60 grayscale"
            )}
          />
          {category && (
            <span className="absolute left-2 top-2 rounded-pill bg-hearth-ink/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-hearth-paper">
              {tx(category.label)}
            </span>
          )}
          {event.status !== "approved" ? (
            <span
              className={cn(
                "absolute right-2 top-2 rounded-pill px-2.5 py-1 text-[10px] font-semibold text-hearth-paper",
                STATUS_BADGE[event.status].className
              )}
            >
              {t(STATUS_BADGE[event.status].label)}
            </span>
          ) : ended ? (
            <span className="absolute right-2 top-2 rounded-pill bg-hearth-charcoal-soft px-2.5 py-1 text-[10px] font-semibold text-hearth-paper">
              {t("statusEnded")}
            </span>
          ) : joined && (
            <span className="absolute right-2 top-2 rounded-pill bg-hearth-success px-2.5 py-1 text-[10px] font-semibold text-hearth-paper">
              {t("joined")}
            </span>
          )}
        </div>

        <div className="mt-3">
          <p className="eyebrow text-hearth-gold">
            {formatEventDateTime(event.startsAt, lang)}
          </p>
          <h3 className="display mt-1 line-clamp-2 text-[17px] text-hearth-ink">
            {tx(event.title)}
          </h3>
          <p className="mt-1 line-clamp-1 text-[13px] text-hearth-charcoal-soft">
            {tx(event.location.name)} · {tx(event.location.area)}
          </p>
          <div className="mt-2.5 flex items-center justify-between">
            <AttendeeAvatarStack people={event.attendees} max={3} />
            <span className="text-[13px] font-semibold text-hearth-ember">
              {tx(event.price)}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
