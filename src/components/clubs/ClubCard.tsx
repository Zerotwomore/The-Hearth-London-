"use client";

import Link from "next/link";
import { Club } from "@/lib/types/club";
import { useAppState } from "@/lib/context/AppStateContext";
import { AttendeeAvatarStack } from "@/components/events/AttendeeAvatarStack";

export function ClubCard({ club }: { club: Club }) {
  const { tx, t, isClubJoined } = useAppState();
  const joined = isClubJoined(club.id);

  return (
    <Link href={`/clubs/${club.id}`} className="group block">
      <article className="flex gap-4">
        <div className="relative h-28 w-22 shrink-0 overflow-hidden rounded-[5px] frame bg-hearth-cream-dark">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={club.imageUrl}
            alt={tx(club.name)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="eyebrow text-hearth-gold">{tx(club.category)}</p>
          <h3 className="display mt-1 text-[17px] text-hearth-ink">
            {tx(club.name)}
          </h3>
          <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-hearth-charcoal-soft">
            {tx(club.description)}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <AttendeeAvatarStack attendeeIds={club.memberIds} max={4} />
            <span className="text-[12px] text-hearth-charcoal-soft">
              {club.memberIds.length} {t("members")}
            </span>
            {joined && (
              <span className="ml-auto rounded-pill bg-hearth-success/15 px-2 py-0.5 text-[11px] font-semibold text-hearth-success">
                {t("joinedClub")}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
