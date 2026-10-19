"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/ui/TopBar";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { Avatar } from "@/components/ui/Avatar";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { Button } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { EventCard } from "@/components/events/EventCard";
import { ClubCard } from "@/components/clubs/ClubCard";
import { SignInPrompt } from "@/components/auth/SignInPrompt";
import { LoadingState } from "@/components/ui/StatusMessage";
import { useEvents, useHostedEvents, useMyEventIds, usePendingEvents } from "@/lib/api/events";
import { useClubs, useMyClubIds } from "@/lib/api/clubs";
import { useInterests } from "@/lib/api/profile";
import { signOut } from "@/lib/api/auth";
import { useAppState } from "@/lib/context/AppStateContext";
import { displayName, hasEnded } from "@/lib/utils";

export default function ProfilePage() {
  const router = useRouter();
  const { t, tx, lang, userId, email, profile, authReady, profileLoading } = useAppState();
  const { data: events } = useEvents();
  const { data: myEventIds } = useMyEventIds();
  const { data: hostedEvents } = useHostedEvents();
  const { data: pendingEvents } = usePendingEvents(Boolean(profile?.isAdmin));
  const { data: clubs } = useClubs();
  const { data: myClubIds } = useMyClubIds();
  const { data: interests } = useInterests();

  // Hosted events have their own section.
  const joinedEvents = (events ?? []).filter(
    (event) => myEventIds?.has(event.id) && event.hostId !== userId && !hasEnded(event)
  );
  const joinedClubs = (clubs ?? []).filter((club) => myClubIds?.has(club.id));
  const myInterests = (interests ?? []).filter((interest) =>
    profile?.interestIds.includes(interest.id)
  );

  const topBar = <TopBar title={t("profileTitle")} large action={<LanguageToggle />} />;

  if (!authReady || profileLoading) {
    return (
      <>
        {topBar}
        <LoadingState />
      </>
    );
  }
  if (!userId || !profile) {
    return (
      <>
        {topBar}
        <SignInPrompt message="logInForProfile" />
      </>
    );
  }

  return (
    <>
      {topBar}

      <div className="px-5 pt-6 pb-24">
        <div className="flex items-center gap-4">
          <Avatar name={profile.name} src={profile.avatarUrl} size="lg" />
          <div className="min-w-0 flex-1">
            <h2 className="display flex flex-wrap items-center gap-1.5 text-[22px] text-hearth-ink">
              {displayName(profile, lang)}
              {profile.verified && <VerifiedBadge size="md" />}
            </h2>
            {email && <p className="mt-1 truncate text-[12px] text-hearth-charcoal-soft">{email}</p>}
            {profile.bio && (
              <p className="mt-1 text-[13px] leading-relaxed text-hearth-charcoal-soft">
                {profile.bio}
              </p>
            )}
          </div>
        </div>

        <div className="mt-5 flex gap-8 border-y border-hearth-ink/10 py-3.5">
          <div>
            <p className="display text-[22px] text-hearth-ink">{myEventIds?.size ?? 0}</p>
            <p className="eyebrow text-hearth-charcoal-soft">{t("eventsJoined")}</p>
          </div>
          <div>
            <p className="display text-[22px] text-hearth-ink">{myClubIds?.size ?? 0}</p>
            <p className="eyebrow text-hearth-charcoal-soft">{t("clubsJoined")}</p>
          </div>
          <div className="ml-auto self-center">
            <Link href="/onboarding">
              <Button variant="outline" size="sm">
                {t("editProfile")}
              </Button>
            </Link>
          </div>
        </div>

        {myInterests.length > 0 && (
          <section className="pt-6">
            <SectionHeader title={t("yourInterests")} />
            <div className="flex flex-wrap gap-2">
              {myInterests.map((interest) => (
                <span
                  key={interest.id}
                  className="rounded-pill border border-hearth-ink/12 bg-hearth-paper px-3.5 py-1.5 text-[13px] text-hearth-charcoal"
                >
                  {tx(interest.label)}
                </span>
              ))}
            </div>
          </section>
        )}

        {profile.isAdmin && (
          <Link
            href="/events/review"
            className="mt-6 flex items-center justify-between rounded-card border border-hearth-gold/40 bg-hearth-paper px-4 py-3"
          >
            <span className="text-[15px] font-semibold text-hearth-ink">{t("reviewEvents")}</span>
            <span className="text-[13px] text-hearth-ember">
              {pendingEvents ? `${pendingEvents.length} ${t("statusPending").toLowerCase()} →` : "→"}
            </span>
          </Link>
        )}

        <section className="pt-8">
          <SectionHeader
            title={t("yourHostedEvents")}
            actionLabel={t("hostEvent")}
            actionHref="/events/new"
          />
          {(hostedEvents ?? []).length === 0 ? (
            <p className="text-[14px] text-hearth-charcoal-soft">{t("noHostedEvents")}</p>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-7">
              {hostedEvents!.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </section>

        <section className="pt-8">
          <SectionHeader
            title={t("upcomingEvents")}
            actionLabel={t("browseEvents")}
            actionHref="/events"
          />
          {joinedEvents.length === 0 ? (
            <p className="text-[14px] text-hearth-charcoal-soft">{t("noJoinedEvents")}</p>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-7">
              {joinedEvents.map((event) => (
                <EventCard key={event.id} event={event} joined />
              ))}
            </div>
          )}
        </section>

        <section className="pt-8">
          <SectionHeader
            title={t("yourClubs")}
            actionLabel={t("browseClubs")}
            actionHref="/clubs"
          />
          {joinedClubs.length === 0 ? (
            <p className="text-[14px] text-hearth-charcoal-soft">{t("noJoinedClubs")}</p>
          ) : (
            <div className="space-y-6">
              {joinedClubs.map((club) => (
                <ClubCard key={club.id} club={club} joined />
              ))}
            </div>
          )}
        </section>

        <div className="mt-10 border-t border-hearth-ink/10 pt-5">
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              await signOut();
              router.push("/onboarding");
            }}
          >
            {t("signOut")}
          </Button>
        </div>
      </div>
    </>
  );
}
