"use client";

import { TopBar } from "@/components/ui/TopBar";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { ClubCard } from "@/components/clubs/ClubCard";
import { CLUBS } from "@/lib/data/clubs";
import { useAppState } from "@/lib/context/AppStateContext";

export default function ClubsPage() {
  const { t } = useAppState();

  return (
    <>
      <TopBar
        title={t("clubsTitle")}
        subtitle={t("clubsSubtitle")}
        large
        action={<LanguageToggle />}
      />
      <div className="space-y-6 px-5 pt-5 pb-24">
        {CLUBS.map((club) => (
          <ClubCard key={club.id} club={club} />
        ))}
      </div>
    </>
  );
}
