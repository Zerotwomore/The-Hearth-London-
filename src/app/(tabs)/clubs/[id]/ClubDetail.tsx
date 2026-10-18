"use client";

import Link from "next/link";
import { useClub, useMyClubIds, useToggleClub } from "@/lib/api/clubs";
import { errorKey } from "@/lib/api/errors";
import { useAppState } from "@/lib/context/AppStateContext";
import { displayName } from "@/lib/utils";
import { TopBar } from "@/components/ui/TopBar";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { ClubPostCard } from "@/components/clubs/ClubPostCard";
import { ErrorState, LoadingState, StatusMessage } from "@/components/ui/StatusMessage";

export default function ClubDetail({ id }: { id: string }) {
  const { tx, t, lang, userId } = useAppState();
  const clubQuery = useClub(id);
  const { data: myClubIds } = useMyClubIds();
  const toggle = useToggleClub();

  const club = clubQuery.data;
  if (!club) {
    return (
      <>
        <TopBar title={t("navClubs")} backHref="/clubs" />
        {clubQuery.isPending ? (
          <LoadingState />
        ) : clubQuery.isError ? (
          <ErrorState onRetry={() => clubQuery.refetch()} />
        ) : (
          <StatusMessage>{t("clubNotFound")}</StatusMessage>
        )}
      </>
    );
  }

  const joined = Boolean(myClubIds?.has(club.id));

  return (
    <>
      <TopBar title={tx(club.category)} backHref="/clubs" />

      <div className="pb-24">
        <div className="px-5 pt-5">
          <div className="aspect-[16/10] w-full overflow-hidden rounded-[6px] frame bg-hearth-cream-dark">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={club.imageUrl} alt={tx(club.name)} className="h-full w-full object-cover" />
          </div>

          <h2 className="display mt-5 text-[26px] text-hearth-ink">{tx(club.name)}</h2>
          {userId && (
            <p className="mt-1 text-[13px] text-hearth-charcoal-soft">
              {club.members.length} {t("members")}
            </p>
          )}

          <div className="mt-4">
            {userId ? (
              <div className="flex gap-2">
                <Button
                  variant={joined ? "success" : "primary"}
                  size="md"
                  fullWidth
                  disabled={joined || toggle.isPending}
                  onClick={() => toggle.mutate({ clubId: club.id, join: true })}
                >
                  {joined ? `✓ ${t("joinedClub")}` : t("joinClub")}
                </Button>
                {joined && (
                  <Button
                    variant="outline"
                    size="md"
                    disabled={toggle.isPending}
                    onClick={() => toggle.mutate({ clubId: club.id, join: false })}
                  >
                    {t("leaveClub")}
                  </Button>
                )}
              </div>
            ) : (
              <Link href={`/login?next=/clubs/${club.id}`} className="block">
                <Button size="md" fullWidth>
                  {t("logInToJoinClub")}
                </Button>
              </Link>
            )}
            {toggle.error && (
              <p role="alert" className="mt-2 text-center text-[13px] text-hearth-ember">
                {t(errorKey(toggle.error))}
              </p>
            )}
          </div>
        </div>

        <section className="px-5 pt-7">
          <h3 className="display text-lg text-hearth-ink">{t("aboutClub")}</h3>
          <p className="mt-2 text-[15px] leading-relaxed text-hearth-charcoal">
            {tx(club.description)}
          </p>
        </section>

        {/* Members and posts are only visible to signed-in members. */}
        {userId && (
          <>
            {club.members.length > 0 && (
              <section className="px-5 pt-7">
                <h3 className="display text-lg text-hearth-ink">{t("members")}</h3>
                <div className="mt-3 flex flex-wrap gap-4">
                  {club.members.map((member) => (
                    <div key={member.id} className="w-14 text-center">
                      <Avatar name={member.name} src={member.avatarUrl} size="md" />
                      <p className="mt-1 truncate text-[11px] text-hearth-charcoal-soft">
                        {displayName(member, lang, { short: true })}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="px-5 pt-7">
              <h3 className="display text-lg text-hearth-ink">{t("clubPosts")}</h3>
              {club.posts.length === 0 ? (
                <p className="mt-2 text-[14px] text-hearth-charcoal-soft">{t("noPosts")}</p>
              ) : (
                <div className="mt-3 space-y-3">
                  {club.posts.map((post) => (
                    <ClubPostCard key={post.id} post={post} />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </>
  );
}
