"use client";

import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TopBar } from "@/components/ui/TopBar";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { SignInPrompt } from "@/components/auth/SignInPrompt";
import { LoadingState, StatusMessage } from "@/components/ui/StatusMessage";
import { useEvent, useUpdateEvent } from "@/lib/api/events";
import { errorKey } from "@/lib/api/errors";
import { useAppState } from "@/lib/context/AppStateContext";
import { StringKey } from "@/lib/i18n/strings";
import { EventItem } from "@/lib/types/event";
import { eventHref } from "@/lib/routes";
import { hasEnded } from "@/lib/utils";

const MAX_DURATION_MS = 2 * 24 * 60 * 60 * 1000;

const pad = (n: number) => String(n).padStart(2, "0");
/** "2026-10-19" in the browser's time zone. */
const localDate = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
/** "19:30" in the browser's time zone. */
const localTime = (iso: string) => {
  const d = new Date(iso);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

// One static page for every event: the id comes from ?id=… (see lib/routes.ts).
function FromQuery() {
  const id = useSearchParams().get("id") ?? "";
  return <EditEvent key={id} id={id} />;
}

export default function Page() {
  return (
    <Suspense>
      <FromQuery />
    </Suspense>
  );
}

function EditEvent({ id }: { id: string }) {
  const { t, authReady, userId, profileLoading } = useAppState();
  const { data: event, isPending } = useEvent(id);

  const topBar = <TopBar title={t("editEvent")} backHref={eventHref(id)} />;

  if (!authReady || profileLoading || isPending) {
    return (
      <>
        {topBar}
        <LoadingState />
      </>
    );
  }
  if (!userId) {
    return (
      <>
        {topBar}
        <SignInPrompt message="logInToHost" />
      </>
    );
  }
  const editable =
    event &&
    event.hostId === userId &&
    (event.status === "pending" || event.status === "approved") &&
    !hasEnded(event);
  if (!editable) {
    return (
      <>
        {topBar}
        <StatusMessage>{t("eventNotEditable")}</StatusMessage>
      </>
    );
  }

  return (
    <>
      {topBar}
      <div className="px-5 pt-5 pb-28">
        <p className="text-[14px] leading-relaxed text-hearth-charcoal-soft">
          {t("editEventIntro")}
        </p>
        <EditForm event={event} />
      </div>
    </>
  );
}

function EditForm({ event }: { event: EventItem }) {
  const router = useRouter();
  const { t } = useAppState();
  const update = useUpdateEvent();

  const [date, setDate] = useState(localDate(event.startsAt));
  const [startTime, setStartTime] = useState(localTime(event.startsAt));
  const [endTime, setEndTime] = useState(event.endsAt ? localTime(event.endsAt) : "");
  const [locationName, setLocationName] = useState(event.location.name.en);
  const [locationArea, setLocationArea] = useState(event.location.area.en);
  const [description, setDescription] = useState(event.description.en);
  const [formError, setFormError] = useState<StringKey | null>(null);

  const complete =
    date && startTime && locationName.trim() && locationArea.trim() && description.trim();

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!complete) return;
    setFormError(null);

    const startsAt = new Date(`${date}T${startTime}`);
    let endsAt: Date | undefined;
    if (endTime) {
      endsAt = new Date(`${date}T${endTime}`);
      // An end time before the start means it runs past midnight.
      if (endsAt <= startsAt) endsAt = new Date(endsAt.getTime() + 24 * 60 * 60 * 1000);
    }
    if (startsAt <= new Date()) return setFormError("errorStartInPast");
    if (endsAt && endsAt.getTime() - startsAt.getTime() > MAX_DURATION_MS) {
      return setFormError("errorEndTooLong");
    }

    update.mutate(
      {
        eventId: event.id,
        startsAt,
        endsAt,
        locationName: locationName.trim(),
        locationArea: locationArea.trim(),
        description: description.trim(),
      },
      { onSuccess: () => router.push(eventHref(event.id)) }
    );
  }

  const error = formError ?? (update.error ? errorKey(update.error) : null);

  return (
    <form onSubmit={submit} className="mt-6 space-y-6">
      <TextField
        label={t("dateLabel")}
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
      />
      <div className="grid grid-cols-2 gap-3">
        <TextField
          label={t("startTimeLabel")}
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          required
        />
        <TextField
          label={t("endTimeLabel")}
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
        />
      </div>

      <TextField
        label={t("venueLabel")}
        placeholder={t("venuePlaceholder")}
        value={locationName}
        onChange={(e) => setLocationName(e.target.value)}
        maxLength={100}
        required
      />
      <TextField
        label={t("areaLabel")}
        placeholder={t("areaPlaceholder")}
        value={locationArea}
        onChange={(e) => setLocationArea(e.target.value)}
        maxLength={60}
        required
      />

      <label className="block">
        <span className="eyebrow text-hearth-charcoal-soft">{t("descriptionLabel")}</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={2000}
          rows={6}
          required
          className="mt-1.5 w-full rounded-[1rem] border border-hearth-ink/12 bg-hearth-paper px-5 py-3 text-[16px] leading-relaxed text-hearth-ink focus:border-hearth-ember focus:outline-none"
        />
      </label>

      {error && (
        <p role="alert" className="text-center text-[13px] text-hearth-ember">
          {t(error)}
        </p>
      )}

      <Button type="submit" size="lg" fullWidth disabled={!complete || update.isPending}>
        {update.isPending ? t("saving") : t("saveChanges")}
      </Button>
    </form>
  );
}
