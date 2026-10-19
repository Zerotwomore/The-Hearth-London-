"use client";

import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { useJoinRequests, useRespondToJoinRequest } from "@/lib/api/events";
import { errorKey } from "@/lib/api/errors";
import { useAppState } from "@/lib/context/AppStateContext";
import { JoinRequest } from "@/lib/types/event";
import { displayName } from "@/lib/utils";

/**
 * For the host: people asking to join, each with accept and decline, and
 * people they declined, who can still be accepted.
 */
export function JoinRequestList({ eventId }: { eventId: string }) {
  const { t } = useAppState();
  const requests = useJoinRequests(eventId);
  const pending = (requests.data ?? []).filter((request) => request.status === "pending");
  const declined = (requests.data ?? []).filter((request) => request.status === "declined");

  return (
    <section className="px-5 pt-7">
      <h3 className="display text-lg text-hearth-ink">
        {t("joinRequests")}
        {pending.length > 0 && (
          <span className="ml-2 rounded-pill bg-hearth-ember px-2 py-0.5 align-middle text-[12px] font-semibold text-hearth-paper">
            {pending.length}
          </span>
        )}
      </h3>

      {requests.isPending ? (
        <p className="mt-2 text-[14px] text-hearth-charcoal-soft">{t("loading")}</p>
      ) : requests.isError ? (
        <div className="mt-2 flex items-center gap-3">
          <p className="text-[14px] text-hearth-charcoal-soft">{t("errorLoading")}</p>
          <Button variant="outline" size="sm" onClick={() => requests.refetch()}>
            {t("retry")}
          </Button>
        </div>
      ) : (
        <>
          {pending.length === 0 && (
            <p className="mt-2 text-[14px] text-hearth-charcoal-soft">{t("noJoinRequests")}</p>
          )}
          <ul className="mt-3 space-y-3">
            {pending.map((request) => (
              <RequestRow key={request.person.id} eventId={eventId} request={request} />
            ))}
          </ul>

          {declined.length > 0 && (
            <>
              <p className="eyebrow mt-6 text-hearth-charcoal-soft">{t("declinedRequests")}</p>
              <ul className="mt-3 space-y-3">
                {declined.map((request) => (
                  <RequestRow key={request.person.id} eventId={eventId} request={request} />
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </section>
  );
}

/** One person, with their own buttons and error so answers don't mix up. */
function RequestRow({ eventId, request }: { eventId: string; request: JoinRequest }) {
  const { t, lang } = useAppState();
  const respond = useRespondToJoinRequest(eventId);
  const { person } = request;

  return (
    <li>
      <div className="flex items-center gap-3">
        <Avatar name={person.name} src={person.avatarUrl} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 truncate text-[15px] font-semibold text-hearth-ink">
            {displayName(person, lang)}
            {person.verified && <VerifiedBadge />}
          </p>
          {person.bio && (
            <p className="truncate text-[13px] text-hearth-charcoal-soft">{person.bio}</p>
          )}
        </div>
        {request.status === "pending" && (
          <Button
            variant="outline"
            size="sm"
            disabled={respond.isPending}
            onClick={() => respond.mutate({ userId: person.id, accept: false })}
          >
            {t("decline")}
          </Button>
        )}
        <Button
          variant={request.status === "pending" ? "success" : "outline"}
          size="sm"
          disabled={respond.isPending}
          onClick={() => respond.mutate({ userId: person.id, accept: true })}
        >
          {t("accept")}
        </Button>
      </div>
      {respond.error && (
        <p role="alert" className="mt-1 pl-12 text-[13px] text-hearth-ember">
          {t(errorKey(respond.error))}
        </p>
      )}
    </li>
  );
}
