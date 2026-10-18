"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useAppState } from "@/lib/context/AppStateContext";
import { useJoinEvent, useLeaveEvent } from "@/lib/api/events";
import { errorKey } from "@/lib/api/errors";
import { EventItem } from "@/lib/types/event";

interface JoinButtonProps {
  event: EventItem;
  joined: boolean;
}

export function JoinButton({ event, joined }: JoinButtonProps) {
  const { t, userId } = useAppState();
  const join = useJoinEvent();
  const leave = useLeaveEvent();
  const pending = join.isPending || leave.isPending;
  const error = join.error ?? leave.error;

  const started = new Date(event.startsAt) <= new Date();
  const full = event.attendees.length >= event.capacity;

  let button;
  if (!userId) {
    button = (
      <Link href={`/login?next=/events/${event.id}`} className="block">
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
  }

  return (
    <div>
      {button}
      {error && (
        <p role="alert" className="mt-2 text-center text-[13px] text-hearth-ember">
          {t(errorKey(error))}
        </p>
      )}
    </div>
  );
}
