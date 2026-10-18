"use client";

import { ClubPost } from "@/lib/types/club";
import { useAppState } from "@/lib/context/AppStateContext";
import { displayName, formatPostDate } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";

export function ClubPostCard({ post }: { post: ClubPost }) {
  const { t, lang } = useAppState();
  const name = post.author ? displayName(post.author, lang) : t("formerMember");

  return (
    <article className="rounded-card border border-hearth-ink/8 bg-hearth-paper p-4">
      <div className="flex items-center gap-2.5">
        <Avatar name={name} src={post.author?.avatarUrl} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-semibold text-hearth-ink">{name}</p>
          <p className="text-[12px] text-hearth-charcoal-soft">
            {formatPostDate(post.createdAt, lang)}
          </p>
        </div>
      </div>
      <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-hearth-charcoal">
        {post.body}
      </p>
    </article>
  );
}
