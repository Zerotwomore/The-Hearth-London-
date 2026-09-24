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
import { EVENTS } from "@/lib/data/events";
import { CLUBS } from "@/lib/data/clubs";
import { INTERESTS } from "@/lib/data/interests";
import { useAppState } from "@/lib/context/AppStateContext";

const PROVIDER_LABEL = {
  wechat: "providerWechat",
  apple: "providerApple",
  email: "providerEmail",
  guest: "providerGuest",
} as const;

export default function ProfilePage() {
  const router = useRouter();
  const {
    t,
    tx,
    profileDraft,
    authProvider,
    signOut,
    joinedEventIds,
    joinedClubIds,
    selectedInterestIds,
  } = useAppState();

  const joinedEvents = EVENTS.filter((event) =>
    joinedEventIds.includes(event.id)
  );
  const joinedClubs = CLUBS.filter((club) => joinedClubIds.includes(club.id));
  const interests = INTERESTS.filter((interest) =>
    selectedInterestIds.includes(interest.id)
  );

  return (
    <>
      <TopBar title={t("profileTitle")} large action={<LanguageToggle />} />

      <div className="px-5 pt-6 pb-24">
        <div className="flex items-center gap-4">
          <Avatar
            name={profileDraft.name}
            src={profileDraft.avatarUrl}
            size="lg"
          />
          <div className="min-w-0 flex-1">
            <h2 className="display flex flex-wrap items-center gap-1.5 text-[22px] text-hearth-ink">
              {profileDraft.name}
              {profileDraft.verified && <VerifiedBadge size="md" />}
            </h2>
            {authProvider && (
              <p className="mt-1 text-[12px] text-hearth-charcoal-soft">
                {t("signedInWith")}:{" "}
                <span className="font-medium text-hearth-ink">
                  {t(PROVIDER_LABEL[authProvider])}
                </span>
              </p>
            )}
            {profileDraft.bio && (
              <p className="mt-1 text-[13px] leading-relaxed text-hearth-charcoal-soft">
                {profileDraft.bio}
              </p>
            )}
          </div>
        </div>

        <div className="mt-5 flex gap-8 border-y border-hearth-ink/10 py-3.5">
          <div>
            <p className="display text-[22px] text-hearth-ink">
              {joinedEventIds.length}
            </p>
            <p className="eyebrow text-hearth-charcoal-soft">
              {t("eventsJoined")}
            </p>
          </div>
          <div>
            <p className="display text-[22px] text-hearth-ink">
              {joinedClubIds.length}
            </p>
            <p className="eyebrow text-hearth-charcoal-soft">
              {t("clubsJoined")}
            </p>
          </div>
          <div className="ml-auto self-center">
            <Link href="/onboarding">
              <Button variant="outline" size="sm">
                {t("editProfile")}
              </Button>
            </Link>
          </div>
        </div>

        {interests.length > 0 && (
          <section className="pt-6">
            <SectionHeader title={t("yourInterests")} />
            <div className="flex flex-wrap gap-2">
              {interests.map((interest) => (
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

        <section className="pt-8">
          <SectionHeader
            title={t("upcomingEvents")}
            actionLabel={t("browseEvents")}
            actionHref="/events"
          />
          {joinedEvents.length === 0 ? (
            <p className="text-[14px] text-hearth-charcoal-soft">
              {t("noJoinedEvents")}
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-7">
              {joinedEvents.map((event) => (
                <EventCard key={event.id} event={event} />
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
            <p className="text-[14px] text-hearth-charcoal-soft">
              {t("noJoinedClubs")}
            </p>
          ) : (
            <div className="space-y-6">
              {joinedClubs.map((club) => (
                <ClubCard key={club.id} club={club} />
              ))}
            </div>
          )}
        </section>

        <div className="mt-10 border-t border-hearth-ink/10 pt-5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              signOut();
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
