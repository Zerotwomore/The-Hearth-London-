"use client";

import Link from "next/link";
import { useEvent, useCategories, useMyEventIds } from "@/lib/api/events";
import { useEventConversationId } from "@/lib/api/chat";
import { useAppState } from "@/lib/context/AppStateContext";
import { displayName, formatFullDate, formatTimeRange } from "@/lib/utils";
import { chatHref } from "@/lib/routes";
import { Avatar } from "@/components/ui/Avatar";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { JoinButton } from "@/components/events/JoinButton";
import { TopBar } from "@/components/ui/TopBar";
import { ErrorState, LoadingState, StatusMessage } from "@/components/ui/StatusMessage";

export default function EventDetail({ id }: { id: string }) {
  const { tx, t, lang, userId } = useAppState();
  const eventQuery = useEvent(id);
  const { data: categories } = useCategories();
  const { data: myEventIds } = useMyEventIds();

  const event = eventQuery.data;
  const joined = Boolean(event && myEventIds?.has(event.id));
  const isMember = joined || Boolean(event && event.hostId === userId);
  const { data: conversationId } = useEventConversationId(id, isMember);

  if (!event) {
    return (
      <>
        <TopBar title={t("navEvents")} backHref="/events" />
        {eventQuery.isPending ? (
          <LoadingState />
        ) : eventQuery.isError ? (
          <ErrorState onRetry={() => eventQuery.refetch()} />
        ) : (
          <StatusMessage>{t("eventNotFound")}</StatusMessage>
        )}
      </>
    );
  }

  const category = categories?.find((item) => item.id === event.categoryId);
  const host = event.host;
  const spotsLeft = Math.max(0, event.capacity - event.attendees.length);

  return (
    <>
      <TopBar title={category ? tx(category.label) : t("navEvents")} backHref="/events" />

      <div className="pb-32">
        {/* Poster */}
        <div className="px-5 pt-5">
          <div className="mx-auto aspect-[3/4] w-[78%] overflow-hidden rounded-[6px] frame bg-hearth-cream-dark">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={event.posterUrl} alt={tx(event.title)} className="h-full w-full object-cover" />
          </div>
        </div>

        {/* Title block */}
        <div className="px-5 pt-6">
          <p className="eyebrow text-hearth-gold">
            {formatFullDate(event.startsAt, lang)} ·{" "}
            {formatTimeRange(event.startsAt, event.endsAt, lang)}
          </p>
          <h2 className="display mt-2 text-[26px] text-hearth-ink">{tx(event.title)}</h2>
          <p className="mt-2 text-[15px] text-hearth-charcoal-soft">
            {tx(event.location.name)} · {tx(event.location.area)}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-hearth-ink/10 py-3">
            <span className="text-[15px] font-semibold text-hearth-ember">{tx(event.price)}</span>
            {/* Attendee lists are only visible to members. */}
            {userId && (
              <>
                <span className="text-[13px] text-hearth-charcoal-soft">
                  {event.attendees.length} {t("going")}
                </span>
                <span className="text-[13px] text-hearth-charcoal-soft">
                  {spotsLeft} {t("spotsLeft")}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Host */}
        {host && (
          <div className="px-5 pt-5">
            <div className="flex items-center gap-3">
              <Avatar name={host.name} src={host.avatarUrl} size="md" />
              <div className="min-w-0">
                <p className="eyebrow text-hearth-charcoal-soft">{t("hostedBy")}</p>
                <p className="flex items-center gap-1.5 truncate text-[15px] font-semibold text-hearth-ink">
                  {displayName(host, lang)}
                  {host.verified && <VerifiedBadge />}
                </p>
                {host.bio && (
                  <p className="truncate text-[13px] text-hearth-charcoal-soft">{host.bio}</p>
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
        {event.highlights.length > 0 && (
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
        )}

        {/* Gallery */}
        {event.gallery.length > 0 && (
          <section className="pt-7">
            <div className="no-scrollbar overflow-x-auto px-5">
              <div className="flex gap-3">
                {event.gallery.map((src, index) => (
                  <div
                    key={index}
                    className="h-44 w-36 shrink-0 overflow-hidden rounded-[4px] frame bg-hearth-cream-dark"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Attendees */}
        <section className="px-5 pt-7">
          <h3 className="display text-lg text-hearth-ink">{t("attendees")}</h3>
          {userId ? (
            <div className="mt-3 flex flex-wrap gap-4">
              {event.attendees.map((person) => (
                <div key={person.id} className="w-14 text-center">
                  <Avatar name={person.name} src={person.avatarUrl} size="md" />
                  <p className="mt-1 truncate text-[11px] text-hearth-charcoal-soft">
                    {displayName(person, lang, { short: true })}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-[14px] text-hearth-charcoal-soft">{t("logInToSeeAttendees")}</p>
          )}
        </section>
      </div>

      {/* Sticky CTA */}
      <div className="sticky bottom-0 z-10 border-t border-hearth-ink/10 bg-hearth-cream/95 px-5 py-3 backdrop-blur">
        <JoinButton event={event} joined={joined} />
        {conversationId ? (
          <Link
            href={chatHref(conversationId)}
            className="mt-2 block text-center text-[13px] text-hearth-charcoal-soft hover:text-hearth-ember"
          >
            {t("openGroupChat")} →
          </Link>
        ) : (
          event.pricePence > 0 && (
            <p className="mt-2 text-center text-[12px] text-hearth-charcoal-soft">
              {t("payAtEvent")}
            </p>
          )
        )}
      </div>
    </>
  );
}
