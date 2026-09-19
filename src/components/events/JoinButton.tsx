"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useAppState } from "@/lib/context/AppStateContext";
import { EventItem } from "@/lib/types/event";

export function JoinButton({ event }: { event: EventItem }) {
  const { isEventJoined, toggleJoinEvent, t, isVip } = useAppState();
  const joined = isEventJoined(event.id);
  const locked = Boolean(event.vipOnly) && !isVip;

  if (locked) {
    return (
      <div>
        <p className="mb-2 text-center text-[13px] text-hearth-charcoal-soft">
          {t("vipOnlyLocked")}
        </p>
        <Link href="/vip" className="block">
          <Button variant="ink" size="lg" fullWidth>
            ★ {t("vipUnlock")}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <Button
      variant={joined ? "success" : "primary"}
      size="lg"
      fullWidth
      onClick={() => toggleJoinEvent(event.id)}
    >
      {joined ? `✓ ${t("joined")}` : t("join")}
    </Button>
  );
}
