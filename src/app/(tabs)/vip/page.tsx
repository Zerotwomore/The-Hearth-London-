"use client";

import { useState } from "react";
import Link from "next/link";
import { TopBar } from "@/components/ui/TopBar";
import { Button } from "@/components/ui/Button";
import { VipBadge } from "@/components/ui/VipBadge";
import { EventCard } from "@/components/events/EventCard";
import { EVENTS } from "@/lib/data/events";
import { useAppState } from "@/lib/context/AppStateContext";
import { StringKey } from "@/lib/i18n/strings";
import { formatFullDate } from "@/lib/utils";

const PERKS: StringKey[] = [
  "vipPerkPriority",
  "vipPerkExclusive",
  "vipPerkDiscount",
  "vipPerkHost",
  "vipPerkFantuan",
];

export default function VipPage() {
  const { t, lang, isVip, vipSince, startVip, endVip } = useAppState();
  const [pending, setPending] = useState(false);

  const memberEvents = EVENTS.filter((event) => event.vipOnly);

  function handleJoin() {
    setPending(true);
    // Prototype: stand in for a checkout round-trip.
    window.setTimeout(() => {
      startVip();
      setPending(false);
    }, 700);
  }

  return (
    <>
      <TopBar title={t("vipTitle")} backHref="/profile" />

      <div className="pb-24">
        {/* Masthead */}
        <div className="border-b border-hearth-ink/10 bg-hearth-ink px-5 py-9 text-hearth-paper">
          <VipBadge label={t("vip")} solid />
          <h2 className="display mt-4 text-[30px] leading-tight">
            {t("vipTagline")}
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-hearth-paper/70">
            {t("vipIntro")}
          </p>

          {isVip && (
            <div className="mt-6 flex items-center gap-2 rounded-card border border-hearth-gold/40 bg-hearth-gold/10 px-4 py-3">
              <span className="text-[15px] font-semibold text-hearth-gold">
                ✓ {t("vipActive")}
              </span>
              {vipSince && (
                <span className="text-[12px] text-hearth-paper/60">
                  {t("vipSince")} {formatFullDate(vipSince, lang)}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Perks */}
        <section className="px-5 pt-7">
          <ul className="space-y-4">
            {PERKS.map((perk) => (
              <li key={perk} className="flex gap-3">
                <span className="mt-1.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-hearth-gold/20">
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#b08d4f"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 12.5l5.5 5.5L20 6.5" />
                  </svg>
                </span>
                <span className="text-[15px] leading-relaxed text-hearth-charcoal">
                  {t(perk)}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Members-only events */}
        {memberEvents.length > 0 && (
          <section className="px-5 pt-9">
            <div className="mb-3 flex items-center gap-2">
              <h3 className="display text-lg text-hearth-ink">
                {t("vipOnlyEvent")}
              </h3>
              <VipBadge label={t("vip")} />
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-7">
              {memberEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </section>
        )}

        {/* Price / action */}
        <section className="px-5 pt-9">
          <div className="rounded-card border border-hearth-gold/40 bg-hearth-paper p-5 text-center">
            <p className="display text-[28px] text-hearth-ink">
              {t("vipPrice")}
            </p>
            <p className="mt-1 text-[13px] text-hearth-charcoal-soft">
              {t("vipCancel")}
            </p>

            <div className="mt-5">
              {isVip ? (
                <Button variant="outline" size="md" fullWidth onClick={endVip}>
                  {t("vipLeave")}
                </Button>
              ) : (
                <Button
                  variant="ink"
                  size="lg"
                  fullWidth
                  disabled={pending}
                  onClick={handleJoin}
                >
                  {pending ? t("connecting") : t("vipJoin")}
                </Button>
              )}
            </div>

            <p className="mt-3 text-[12px] text-hearth-charcoal-soft">
              {t("vipMockNote")}
            </p>
          </div>

          <Link
            href="/events"
            className="mt-5 block text-center text-[14px] text-hearth-charcoal-soft hover:text-hearth-ember"
          >
            {t("browseEvents")}
          </Link>
        </section>
      </div>
    </>
  );
}
