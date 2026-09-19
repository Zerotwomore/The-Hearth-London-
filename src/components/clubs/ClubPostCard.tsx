"use client";

import { ClubPost } from "@/lib/types/club";
import { getUserById } from "@/lib/data/users";
import { useAppState } from "@/lib/context/AppStateContext";
import { formatPostDate } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";

export function ClubPostCard({ post }: { post: ClubPost }) {
  const { tx, lang } = useAppState();
  const author = getUserById(post.authorId);

  return (
    <article className="rounded-card border border-hearth-ink/8 bg-hearth-paper p-4">
      <div className="flex items-center gap-2.5">
        <Avatar name={author?.name ?? "?"} src={author?.avatarUrl} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-semibold text-hearth-ink">
            {lang === "zh" && author?.nameZh ? author.nameZh : author?.name}
          </p>
          <p className="text-[12px] text-hearth-charcoal-soft">
            {formatPostDate(post.createdAt, lang)}
          </p>
        </div>
      </div>
      <p className="mt-3 text-[15px] leading-relaxed text-hearth-charcoal">
        {tx(post.content)}
      </p>
    </article>
  );
}
