"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useAppState } from "@/lib/context/AppStateContext";
import {
  useJoinEvent,
  useLeaveEvent,
  useMyJoinRequests,
  useWithdrawJoinRequest,
} from "@/lib/api/events";
import { errorKey } from "@/lib/api/errors";
import { EventItem } from "@/lib/types/event";
import { eventHref, loginHref } from "@/lib/routes";

interface JoinButtonProps {
  event: EventItem;
  joined: boolean;
}

export function JoinButton({ event, joined }: JoinButtonProps) {
  const { t, userId } = useAppState();
  const { data: myRequests } = useMyJoinRequests();
  const join = useJoinEvent();
  const leave = useLeaveEvent();
  const withdraw = useWithdrawJoinRequest();
  const pending = join.isPending || leave.isPending || withdraw.isPending;
  const error = join.error ?? leave.error ?? withdraw.error;

  const started = new Date(event.startsAt) <= new Date();
  const full = event.attendees.length >= event.capacity;
  const request = myRequests?.get(event.id);

  let button;
  let note: string | null = null;
  if (!userId) {
    button = (
      <Link href={loginHref(eventHref(event.id))} className="block">
        <Button size="lg" fullWidth>
          {t("logInToJoin")}
        </Button>
      </Link>
    );
  } else if (event.hostId === userId) {
    button = (
      <Button variant="success" size="lg" fullWidth disabled>
        {t("hosting")}
      </Button>
    );
  } else if (joined) {
    button = (
      <div className="flex gap-2">
        <Button variant="success" size="lg" fullWidth disabled>
          ✓ {t("joined")}
        </Button>
        {!started && (
          <Button
            variant="outline"
            size="lg"
            disabled={pending}
            onClick={() => leave.mutate(event.id)}
          >
            {t("leaveEvent")}
          </Button>
        )}
      </div>
    );
  } else if (request === "pending") {
    button = (
      <div className="flex gap-2">
        <Button variant="secondary" size="lg" fullWidth disabled>
          {t("requestSent")}
        </Button>
        <Button
          variant="outline"
          size="lg"
          disabled={pending}
          onClick={() => withdraw.mutate(event.id)}
        >
          {t("withdrawRequest")}
        </Button>
      </div>
    );
    note = t("requestPendingNote");
  } else if (request === "declined") {
    button = (
      <Button size="lg" fullWidth disabled>
        {t("requestDeclined")}
      </Button>
    );
  } else if (started || full) {
    button = (
      <Button size="lg" fullWidth disabled>
        {started ? t("eventStarted") : t("eventFull")}
      </Button>
    );
  } else {
    button = (
      <Button size="lg" fullWidth disabled={pending} onClick={() => join.mutate(event.id)}>
        {t("join")}
      </Button>
    );
    note = t("hostApprovesNote");
  }

  return (
    <div>
      {button}
      {error ? (
        <p role="alert" className="mt-2 text-center text-[13px] text-hearth-ember">
          {t(errorKey(error))}
        </p>
      ) : (
        note && <p className="mt-2 text-center text-[12px] text-hearth-charcoal-soft">{note}</p>
      )}
    </div>
  );
}
