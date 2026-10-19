"use client";

import { useState } from "react";
import Link from "next/link";
import { TopBar } from "@/components/ui/TopBar";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { SignInPrompt } from "@/components/auth/SignInPrompt";
import { ErrorState, LoadingState, StatusMessage } from "@/components/ui/StatusMessage";
import { useCategories, usePendingEvents, useReviewEvent } from "@/lib/api/events";
import { errorKey } from "@/lib/api/errors";
import { useAppState } from "@/lib/context/AppStateContext";
import { EventDetailItem } from "@/lib/types/event";
import { eventHref } from "@/lib/routes";
import { displayName, formatFullDate, formatTimeRange } from "@/lib/utils";

/** Admins approve or reject events submitted by members. */
export default function ReviewEventsPage() {
  const { t, authReady, userId, profile, profileLoading } = useAppState();
  const isAdmin = Boolean(profile?.isAdmin);
  const pending = usePendingEvents(isAdmin);

  const topBar = <TopBar title={t("reviewEvents")} backHref="/profile" />;

  let body;
  if (!authReady || profileLoading) {
    body = <LoadingState />;
  } else if (!userId) {
    body = <SignInPrompt message="logInForProfile" />;
  } else if (!isAdmin) {
    body = <StatusMessage>{t("adminsOnly")}</StatusMessage>;
  } else if (pending.isPending) {
    body = <LoadingState />;
  } else if (pending.isError) {
    body = <ErrorState onRetry={() => pending.refetch()} />;
  } else if (pending.data.length === 0) {
    body = <StatusMessage>{t("reviewQueueEmpty")}</StatusMessage>;
  } else {
    body = (
      <div className="space-y-5 px-5 pt-5 pb-24">
        {pending.data.map((event) => (
          <PendingEvent key={event.id} event={event} />
        ))}
      </div>
    );
  }

  return (
    <>
      {topBar}
      {body}
    </>
  );
}

function PendingEvent({ event }: { event: EventDetailItem }) {
  const { t, tx, lang } = useAppState();
  const { data: categories } = useCategories();
  const review = useReviewEvent();
  const [rejecting, setRejecting] = useState(false);
  const [note, setNote] = useState("");
  const category = categories?.find((item) => item.id === event.categoryId);

  return (
    <article className="rounded-card border border-hearth-ink/10 bg-hearth-paper p-4 shadow-card">
      <Link href={eventHref(event.id)} className="flex gap-4">
        <div className="aspect-[3/4] w-24 shrink-0 overflow-hidden rounded-[4px] bg-hearth-cream-dark">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={event.posterUrl} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="eyebrow text-hearth-gold">
            {formatFullDate(event.startsAt, lang)} ·{" "}
            {formatTimeRange(event.startsAt, event.endsAt, lang)}
          </p>
          <h2 className="display mt-1 text-[18px] text-hearth-ink">{tx(event.title)}</h2>
          <p className="mt-1 text-[13px] text-hearth-charcoal-soft">
            {tx(event.location.name)} · {tx(event.location.area)}
          </p>
          <p className="mt-1 text-[13px] text-hearth-charcoal-soft">
            {category ? `${tx(category.label)} · ` : ""}
            {event.capacity} {t("capacityLabel").toLowerCase()} · {tx(event.price)}
          </p>
        </div>
      </Link>

      <p className="mt-3 line-clamp-4 text-[14px] leading-relaxed text-hearth-charcoal">
        {tx(event.description)}
      </p>

      {event.host && (
        <div className="mt-3 flex items-center gap-2">
          <Avatar name={event.host.name} src={event.host.avatarUrl} size="xs" />
          <span className="text-[13px] text-hearth-charcoal-soft">
            {t("submittedBy")} {displayName(event.host, lang)}
          </span>
        </div>
      )}

      {rejecting ? (
        <div className="mt-4 space-y-2">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={500}
            rows={2}
            placeholder={t("rejectNotePlaceholder")}
            className="w-full rounded-[1rem] border border-hearth-ink/12 bg-hearth-cream px-4 py-2.5 text-[15px] text-hearth-ink focus:border-hearth-ember focus:outline-none"
          />
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setRejecting(false)}>
              {t("cancel")}
            </Button>
            <Button
              size="sm"
              fullWidth
              disabled={review.isPending}
              onClick={() => review.mutate({ eventId: event.id, approve: false, note })}
            >
              {t("confirmReject")}
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={review.isPending}
            onClick={() => setRejecting(true)}
          >
            {t("reject")}
          </Button>
          <Button
            variant="success"
            size="sm"
            fullWidth
            disabled={review.isPending}
            onClick={() => review.mutate({ eventId: event.id, approve: true })}
          >
            {t("approve")}
          </Button>
        </div>
      )}

      {review.error && (
        <p role="alert" className="mt-2 text-center text-[13px] text-hearth-ember">
          {t(errorKey(review.error))}
        </p>
      )}
    </article>
  );
}
