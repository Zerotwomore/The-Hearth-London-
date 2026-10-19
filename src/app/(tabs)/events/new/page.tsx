"use client";

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/ui/TopBar";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { TextField } from "@/components/ui/TextField";
import { SignInPrompt } from "@/components/auth/SignInPrompt";
import { LoadingState, StatusMessage } from "@/components/ui/StatusMessage";
import {
  MAX_ACTIVE_EVENTS,
  useCategories,
  useCreateEvent,
  useHostedEvents,
} from "@/lib/api/events";
import { errorKey } from "@/lib/api/errors";
import { useAppState } from "@/lib/context/AppStateContext";
import { StringKey } from "@/lib/i18n/strings";
import { eventHref } from "@/lib/routes";

const MAX_DURATION_MS = 2 * 24 * 60 * 60 * 1000;

export default function NewEventPage() {
  const { t, authReady, userId, profileLoading } = useAppState();
  const hosted = useHostedEvents();

  const topBar = <TopBar title={t("hostEvent")} backHref="/events" />;

  if (!authReady || profileLoading || (userId && hosted.isPending)) {
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

  // Rejected events don't count towards the limit.
  const active = (hosted.data ?? []).filter((event) => event.status !== "rejected").length;

  return (
    <>
      {topBar}
      <div className="px-5 pt-5 pb-28">
        <p className="text-[14px] leading-relaxed text-hearth-charcoal-soft">
          {t("hostEventIntro")}
        </p>
        <p className="eyebrow mt-3 text-hearth-gold">
          {active} / {MAX_ACTIVE_EVENTS} {t("activeEventCount")}
        </p>
        {active >= MAX_ACTIVE_EVENTS ? (
          <StatusMessage>{t("eventLimitReached")}</StatusMessage>
        ) : (
          <EventForm />
        )}
      </div>
    </>
  );
}

/** "2026-10-19" and "19:30" in the browser's time zone. */
function toLocalDate(date: string, time: string): Date {
  return new Date(`${date}T${time}`);
}

function EventForm() {
  const router = useRouter();
  const { t, tx, profile } = useAppState();
  const { data: categories = [] } = useCategories();
  const create = useCreateEvent();

  const [poster, setPoster] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("19:00");
  const [endTime, setEndTime] = useState("");
  const [locationName, setLocationName] = useState("");
  const [locationArea, setLocationArea] = useState("");
  const [capacity, setCapacity] = useState("10");
  const [price, setPrice] = useState("0");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState<StringKey | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  // Free the preview's memory when it's replaced or the form closes.
  useEffect(() => {
    return () => {
      if (posterPreview) URL.revokeObjectURL(posterPreview);
    };
  }, [posterPreview]);

  function handlePoster(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setPoster(file);
    setPosterPreview(URL.createObjectURL(file));
  }

  const capacityNumber = Number(capacity);
  const pricePence = Math.round(Number(price || "0") * 100);
  const complete =
    poster &&
    title.trim() &&
    categoryId &&
    date &&
    startTime &&
    locationName.trim() &&
    locationArea.trim() &&
    description.trim() &&
    Number.isInteger(capacityNumber) &&
    capacityNumber >= 1 &&
    capacityNumber <= 200 &&
    Number.isFinite(pricePence) &&
    pricePence >= 0 &&
    pricePence <= 100000;

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!complete || !poster) return;
    setFormError(null);

    const startsAt = toLocalDate(date, startTime);
    let endsAt: Date | undefined;
    if (endTime) {
      endsAt = toLocalDate(date, endTime);
      // An end time before the start means it runs past midnight.
      if (endsAt <= startsAt) endsAt = new Date(endsAt.getTime() + 24 * 60 * 60 * 1000);
    }
    if (startsAt <= new Date()) return setFormError("errorStartInPast");
    if (endsAt && endsAt.getTime() - startsAt.getTime() > MAX_DURATION_MS) {
      return setFormError("errorEndTooLong");
    }

    create.mutate(
      {
        title: title.trim(),
        categoryId,
        poster,
        startsAt,
        endsAt,
        locationName: locationName.trim(),
        locationArea: locationArea.trim(),
        capacity: capacityNumber,
        description: description.trim(),
        pricePence,
      },
      { onSuccess: (id) => router.push(eventHref(id)) }
    );
  }

  const error = formError ?? (create.error ? errorKey(create.error) : null);

  return (
    <form onSubmit={submit} className="mt-6 space-y-6">
      <div>
        <span className="eyebrow text-hearth-charcoal-soft">{t("posterLabel")}</span>
        <div className="mt-2 flex items-end gap-4">
          <div className="aspect-[3/4] w-28 shrink-0 overflow-hidden rounded-[6px] frame bg-hearth-cream-dark">
            {posterPreview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={posterPreview} alt="" className="h-full w-full object-cover" />
            )}
          </div>
          <div className="flex flex-col items-start gap-1">
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePoster}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInput.current?.click()}
            >
              {poster ? t("changePoster") : t("choosePoster")}
            </Button>
            <span className="pl-1 text-[12px] text-hearth-charcoal-soft">{t("posterHint")}</span>
          </div>
        </div>
      </div>

      <TextField
        label={t("eventTitleLabel")}
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        maxLength={100}
        required
      />

      <div>
        <span className="eyebrow text-hearth-charcoal-soft">{t("categoryLabel")}</span>
        <div className="mt-2 flex flex-wrap gap-2">
          {categories.map((category) => (
            <Chip
              key={category.id}
              selected={categoryId === category.id}
              onClick={() => setCategoryId(category.id)}
            >
              {tx(category.label)}
            </Chip>
          ))}
        </div>
      </div>

      <TextField
        label={t("dateLabel")}
        type="date"
        value={date}
        onChange={(event) => setDate(event.target.value)}
        required
      />
      <div className="grid grid-cols-2 gap-3">
        <TextField
          label={t("startTimeLabel")}
          type="time"
          value={startTime}
          onChange={(event) => setStartTime(event.target.value)}
          required
        />
        <TextField
          label={t("endTimeLabel")}
          type="time"
          value={endTime}
          onChange={(event) => setEndTime(event.target.value)}
        />
      </div>

      <TextField
        label={t("venueLabel")}
        placeholder={t("venuePlaceholder")}
        value={locationName}
        onChange={(event) => setLocationName(event.target.value)}
        maxLength={100}
        required
      />
      <TextField
        label={t("areaLabel")}
        placeholder={t("areaPlaceholder")}
        value={locationArea}
        onChange={(event) => setLocationArea(event.target.value)}
        maxLength={60}
        required
      />

      <div className="grid grid-cols-2 gap-3">
        <TextField
          label={t("capacityLabel")}
          hint={t("capacityHint")}
          type="number"
          inputMode="numeric"
          min={1}
          max={200}
          step={1}
          value={capacity}
          onChange={(event) => setCapacity(event.target.value)}
          required
        />
        <TextField
          label={t("priceLabel")}
          hint={t("priceHint")}
          type="number"
          inputMode="decimal"
          min={0}
          max={1000}
          step={0.01}
          value={price}
          onChange={(event) => setPrice(event.target.value)}
        />
      </div>

      <label className="block">
        <span className="eyebrow text-hearth-charcoal-soft">{t("descriptionLabel")}</span>
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
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

      <Button type="submit" size="lg" fullWidth disabled={!complete || create.isPending}>
        {create.isPending
          ? t("submitting")
          : // Admins' events are approved straight away.
            profile?.isAdmin
            ? t("publishEvent")
            : t("submitForReview")}
      </Button>
    </form>
  );
}
