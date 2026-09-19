"use client";

import { notFound } from "next/navigation";
import { getClubById } from "@/lib/data/clubs";
import { getUserById } from "@/lib/data/users";
import { useAppState } from "@/lib/context/AppStateContext";
import { TopBar } from "@/components/ui/TopBar";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { ClubPostCard } from "@/components/clubs/ClubPostCard";

export default function ClubDetail({ id }: { id: string }) {
  const club = getClubById(id);
  const { tx, t, lang, isClubJoined, toggleJoinClub } = useAppState();

  if (!club) notFound();

  const joined = isClubJoined(club.id);

  return (
    <>
      <TopBar title={tx(club.category)} backHref="/clubs" />

      <div className="pb-24">
        <div className="px-5 pt-5">
          <div className="aspect-[16/10] w-full overflow-hidden rounded-[6px] frame bg-hearth-cream-dark">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={club.imageUrl}
              alt={tx(club.name)}
              className="h-full w-full object-cover"
            />
          </div>

          <h2 className="display mt-5 text-[26px] text-hearth-ink">
            {tx(club.name)}
          </h2>
          <p className="mt-1 text-[13px] text-hearth-charcoal-soft">
            {club.memberIds.length} {t("members")}
          </p>

          <div className="mt-4">
            <Button
              variant={joined ? "success" : "primary"}
              size="md"
              fullWidth
              onClick={() => toggleJoinClub(club.id)}
            >
              {joined ? `✓ ${t("joinedClub")}` : t("joinClub")}
            </Button>
          </div>
        </div>

        <section className="px-5 pt-7">
          <h3 className="display text-lg text-hearth-ink">{t("aboutClub")}</h3>
          <p className="mt-2 text-[15px] leading-relaxed text-hearth-charcoal">
            {tx(club.description)}
          </p>
        </section>

        <section className="px-5 pt-7">
          <h3 className="display text-lg text-hearth-ink">{t("members")}</h3>
          <div className="mt-3 flex flex-wrap gap-4">
            {club.memberIds.map((memberId) => {
              const user = getUserById(memberId);
              if (!user) return null;
              return (
                <div key={memberId} className="w-14 text-center">
                  <Avatar name={user.name} src={user.avatarUrl} size="md" />
                  <p className="mt-1 truncate text-[11px] text-hearth-charcoal-soft">
                    {lang === "zh" && user.nameZh
                      ? user.nameZh
                      : user.name.split(" ")[0]}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="px-5 pt-7">
          <h3 className="display text-lg text-hearth-ink">{t("clubPosts")}</h3>
          <div className="mt-3 space-y-3">
            {club.posts.map((post) => (
              <ClubPostCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
