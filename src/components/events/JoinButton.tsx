"use client";

import { Button } from "@/components/ui/Button";
import { useAppState } from "@/lib/context/AppStateContext";
import { EventItem } from "@/lib/types/event";

export function JoinButton({ event }: { event: EventItem }) {
  const { isEventJoined, toggleJoinEvent, t } = useAppState();
  const joined = isEventJoined(event.id);

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
