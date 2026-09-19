"use client";

import { notFound } from "next/navigation";
import Link from "next/link";
import { getEventById } from "@/lib/data/events";
import { getUserById } from "@/lib/data/users";
import { getCategoryLabel } from "@/lib/data/categories";
import { useAppState } from "@/lib/context/AppStateContext";
import { formatFullDate, formatTimeRange } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { VipBadge } from "@/components/ui/VipBadge";
import { JoinButton } from "@/components/events/JoinButton";
import { TopBar } from "@/components/ui/TopBar";

export default function EventDetail({ id }: { id: string }) {
  const event = getEventById(id);
  const { tx, t, lang, isVip } = useAppState();

  if (!event) notFound();

  const host = getUserById(event.hostId);
  const spotsLeft = event.capacity - event.attendeeIds.length;

  return (
    <>
      <TopBar title={tx(getCategoryLabel(event.category))} backHref="/events" />

      <div className="pb-32">
        {/* Poster */}
        <div className="px-5 pt-5">
          <div className="mx-auto aspect-[3/4] w-[78%] overflow-hidden rounded-[6px] frame bg-hearth-cream-dark">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={event.posterUrl}
              alt={tx(event.title)}
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        {/* Title block */}
        <div className="px-5 pt-6">
          <p className="eyebrow text-hearth-gold">
            {formatFullDate(event.dateTime, lang)} ·{" "}
            {formatTimeRange(event.dateTime, event.endTime, lang)}
          </p>
          <div className="mt-2 flex items-start gap-2">
            <h2 className="display flex-1 text-[26px] text-hearth-ink">
              {tx(event.title)}
            </h2>
            {event.vipOnly && (
              <VipBadge label={t("vipOnlyEvent")} className="mt-1.5" />
            )}
          </div>
          <p className="mt-2 text-[15px] text-hearth-charcoal-soft">
            {tx(event.location.name)} · {tx(event.location.area)}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-hearth-ink/10 py-3">
            {isVip && event.vipPrice ? (
              <span className="flex items-baseline gap-2">
                <span className="text-[14px] text-hearth-charcoal-soft line-through">
                  {tx(event.price)}
                </span>
                <span className="text-[15px] font-semibold text-hearth-gold">
                  {tx(event.vipPrice)}
                </span>
                <span className="text-[11px] uppercase tracking-widest text-hearth-gold">
                  {t("vipSaving")}
                </span>
              </span>
            ) : (
              <span className="text-[15px] font-semibold text-hearth-ember">
                {tx(event.price)}
              </span>
            )}
            <span className="text-[13px] text-hearth-charcoal-soft">
              {event.attendeeIds.length} {t("going")}
            </span>
            <span className="text-[13px] text-hearth-charcoal-soft">
              {spotsLeft} {t("spotsLeft")}
            </span>
          </div>
        </div>

        {/* Host */}
        {host && (
          <div className="px-5 pt-5">
            <div className="flex items-center gap-3">
              <Avatar name={host.name} src={host.avatarUrl} size="md" />
              <div className="min-w-0">
                <p className="eyebrow text-hearth-charcoal-soft">
                  {t("hostedBy")}
                </p>
                <p className="flex items-center gap-1.5 truncate text-[15px] font-semibold text-hearth-ink">
                  {lang === "zh" && host.nameZh ? host.nameZh : host.name}
                  {host.verified && <VerifiedBadge />}
                </p>
                {host.bio && (
                  <p className="truncate text-[13px] text-hearth-charcoal-soft">
                    {tx(host.bio)}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Description */}
        <section className="px-5 pt-7">
          <h3 className="display text-lg text-hearth-ink">{t("aboutEvent")}</h3>
          <p className="mt-2 text-[15px] leading-relaxed text-hearth-charcoal">
            {tx(event.description)}
          </p>
        </section>

        {/* Highlights */}
        <section className="px-5 pt-7">
          <h3 className="display text-lg text-hearth-ink">{t("whatYouGet")}</h3>
          <ul className="mt-3 space-y-3">
            {event.highlights.map((highlight, index) => (
              <li key={index} className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-hearth-gold" />
                <span className="text-[15px] leading-relaxed text-hearth-charcoal">
                  {tx(highlight)}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Gallery */}
        {event.gallery && event.gallery.length > 0 && (
          <section className="pt-7">
            <div className="no-scrollbar overflow-x-auto px-5">
              <div className="flex gap-3">
                {event.gallery.map((src, index) => (
                  <div
                    key={index}
                    className="h-44 w-36 shrink-0 overflow-hidden rounded-[4px] frame bg-hearth-cream-dark"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Attendees */}
        <section className="px-5 pt-7">
          <h3 className="display text-lg text-hearth-ink">{t("attendees")}</h3>
          <div className="mt-3 flex flex-wrap gap-4">
            {event.attendeeIds.map((attendeeId) => {
              const user = getUserById(attendeeId);
              if (!user) return null;
              return (
                <div key={attendeeId} className="w-14 text-center">
                  <Avatar name={user.name} src={user.avatarUrl} size="md" />
                  <p className="mt-1 truncate text-[11px] text-hearth-charcoal-soft">
                    {lang === "zh" && user.nameZh ? user.nameZh : user.name.split(" ")[0]}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Sticky CTA */}
      <div className="sticky bottom-0 z-10 border-t border-hearth-ink/10 bg-hearth-cream/95 px-5 py-3 backdrop-blur">
        <JoinButton event={event} />
        <Link
          href="/chat"
          className="mt-2 block text-center text-[13px] text-hearth-charcoal-soft hover:text-hearth-ember"
        >
          {tx({ en: "Message the host", zh: "联系主办人" })}
        </Link>
      </div>
    </>
  );
}
