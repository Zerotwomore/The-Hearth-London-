"use client";

import { TopBar } from "@/components/ui/TopBar";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { ClubCard } from "@/components/clubs/ClubCard";
import { ErrorState, LoadingState, StatusMessage } from "@/components/ui/StatusMessage";
import { useClubs, useMyClubIds } from "@/lib/api/clubs";
import { useAppState } from "@/lib/context/AppStateContext";

export default function ClubsPage() {
  const { t } = useAppState();
  const clubsQuery = useClubs();
  const { data: myClubIds } = useMyClubIds();

  return (
    <>
      <TopBar title={t("clubsTitle")} subtitle={t("clubsSubtitle")} large action={<LanguageToggle />} />
      {clubsQuery.isPending ? (
        <LoadingState />
      ) : clubsQuery.isError ? (
        <ErrorState onRetry={() => clubsQuery.refetch()} />
      ) : clubsQuery.data.length === 0 ? (
        <StatusMessage>{t("noClubs")}</StatusMessage>
      ) : (
        <div className="space-y-6 px-5 pt-5 pb-24">
          {clubsQuery.data.map((club) => (
            <ClubCard key={club.id} club={club} joined={myClubIds?.has(club.id)} />
          ))}
        </div>
      )}
    </>
  );
}
