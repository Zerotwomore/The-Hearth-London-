"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useCancelEvent, useDeleteEvent } from "@/lib/api/events";
import { errorKey } from "@/lib/api/errors";
import { useAppState } from "@/lib/context/AppStateContext";
import { EventItem } from "@/lib/types/event";
import { hasEnded } from "@/lib/utils";

/**
 * For the host: cancel (keeps the event, labelled cancelled, for attendees)
 * or delete (removes it and its chat for good). Both ask first.
 */
export function HostControls({ event }: { event: EventItem }) {
  const router = useRouter();
  const { t } = useAppState();
  const cancel = useCancelEvent();
  const remove = useDeleteEvent();
  const [confirming, setConfirming] = useState<"cancel" | "delete" | null>(null);

  const canCancel =
    (event.status === "pending" || event.status === "approved") && !hasEnded(event);
  const busy = cancel.isPending || remove.isPending;
  const error = cancel.error ?? remove.error;

  return (
    <section className="px-5 pt-7">
      <h3 className="display text-lg text-hearth-ink">{t("manageEvent")}</h3>

      {confirming ? (
        <div className="mt-3 rounded-card border border-hearth-ember/30 bg-hearth-paper p-4">
          <p className="text-[14px] leading-relaxed text-hearth-charcoal">
            {t(confirming === "cancel" ? "confirmCancelEvent" : "confirmDeleteEvent")}
          </p>
          <div className="mt-3 flex gap-2">
            <Button variant="outline" size="sm" disabled={busy} onClick={() => setConfirming(null)}>
              {t("keepEvent")}
            </Button>
            <Button
              size="sm"
              fullWidth
              disabled={busy}
              onClick={() =>
                confirming === "cancel"
                  ? cancel.mutate(event.id, { onSuccess: () => setConfirming(null) })
                  : remove.mutate(event.id, { onSuccess: () => router.push("/profile") })
              }
            >
              {t(confirming === "cancel" ? "yesCancel" : "yesDelete")}
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-3 flex gap-2">
          {canCancel && (
            <Button variant="outline" size="sm" onClick={() => setConfirming("cancel")}>
              {t("cancelEvent")}
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => setConfirming("delete")}>
            {t("deleteEvent")}
          </Button>
        </div>
      )}

      {error && (
        <p role="alert" className="mt-2 text-[13px] text-hearth-ember">
          {t(errorKey(error))}
        </p>
      )}
    </section>
  );
}
