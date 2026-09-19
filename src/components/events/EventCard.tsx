"use client";

import Link from "next/link";
import { EventItem } from "@/lib/types/event";
import { useAppState } from "@/lib/context/AppStateContext";
import { getCategoryLabel } from "@/lib/data/categories";
import { formatEventDateTime } from "@/lib/utils";
import { AttendeeAvatarStack } from "@/components/events/AttendeeAvatarStack";
import { VipBadge } from "@/components/ui/VipBadge";

export function EventCard({ event }: { event: EventItem }) {
  const { tx, t, isEventJoined, lang, isVip } = useAppState();
  const joined = isEventJoined(event.id);
  const showVipPrice = isVip && event.vipPrice;

  return (
    <Link href={`/events/${event.id}`} className="group block">
      <article className="flex flex-col">
        <div className="relative aspect-[3/4] overflow-hidden rounded-[6px] frame bg-hearth-cream-dark">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={event.posterUrl}
            alt={tx(event.title)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
          <span className="absolute left-2 top-2 rounded-pill bg-hearth-ink/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-hearth-paper">
            {tx(getCategoryLabel(event.category))}
          </span>
          {joined ? (
            <span className="absolute right-2 top-2 rounded-pill bg-hearth-success px-2.5 py-1 text-[10px] font-semibold text-hearth-paper">
              {t("joined")}
            </span>
          ) : (
            event.vipOnly && (
              <VipBadge
                label={t("vip")}
                solid
                className="absolute right-2 top-2"
              />
            )
          )}
        </div>

        <div className="mt-3">
          <p className="eyebrow text-hearth-gold">
            {formatEventDateTime(event.dateTime, lang)}
          </p>
          <h3 className="display mt-1 line-clamp-2 text-[17px] text-hearth-ink">
            {tx(event.title)}
          </h3>
          <p className="mt-1 line-clamp-1 text-[13px] text-hearth-charcoal-soft">
            {tx(event.location.name)} · {tx(event.location.area)}
          </p>
          <div className="mt-2.5 flex items-center justify-between">
            <AttendeeAvatarStack attendeeIds={event.attendeeIds} max={3} />
            {showVipPrice ? (
              <span className="flex items-baseline gap-1.5">
                <span className="text-[12px] text-hearth-charcoal-soft line-through">
                  {tx(event.price)}
                </span>
                <span className="text-[13px] font-semibold text-hearth-gold">
                  {tx(event.vipPrice!)}
                </span>
              </span>
            ) : (
              <span className="text-[13px] font-semibold text-hearth-ember">
                {tx(event.price)}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
