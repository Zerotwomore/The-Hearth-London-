"use client";

import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { useJoinRequests, useRespondToJoinRequest } from "@/lib/api/events";
import { errorKey } from "@/lib/api/errors";
import { useAppState } from "@/lib/context/AppStateContext";
import { displayName } from "@/lib/utils";

/** For the host: people asking to join, each with accept and decline. */
export function JoinRequestList({ eventId }: { eventId: string }) {
  const { t, lang } = useAppState();
  const requests = useJoinRequests(eventId, true);
  const respond = useRespondToJoinRequest(eventId);

  return (
    <section className="px-5 pt-7">
      <h3 className="display text-lg text-hearth-ink">
        {t("joinRequests")}
        {requests.data && requests.data.length > 0 && (
          <span className="ml-2 rounded-pill bg-hearth-ember px-2 py-0.5 align-middle text-[12px] font-semibold text-hearth-paper">
            {requests.data.length}
          </span>
        )}
      </h3>

      {requests.data && requests.data.length === 0 && (
        <p className="mt-2 text-[14px] text-hearth-charcoal-soft">{t("noJoinRequests")}</p>
      )}

      <ul className="mt-3 space-y-3">
        {requests.data?.map(({ person }) => {
          const busy = respond.isPending && respond.variables?.userId === person.id;
          return (
            <li key={person.id} className="flex items-center gap-3">
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
              <Button
                variant="outline"
                size="sm"
                disabled={busy}
                onClick={() => respond.mutate({ userId: person.id, accept: false })}
              >
                {t("decline")}
              </Button>
              <Button
                variant="success"
                size="sm"
                disabled={busy}
                onClick={() => respond.mutate({ userId: person.id, accept: true })}
              >
                {t("accept")}
              </Button>
            </li>
          );
        })}
      </ul>

      {respond.error && (
        <p role="alert" className="mt-2 text-[13px] text-hearth-ember">
          {t(errorKey(respond.error))}
        </p>
      )}
    </section>
  );
}
