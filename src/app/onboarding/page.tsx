"use client";

import { ChangeEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { useAppState } from "@/lib/context/AppStateContext";
import { saveProfile, uploadAvatar } from "@/lib/api/profile";
import { avatarUrl } from "@/lib/api/rows";
import { errorKey } from "@/lib/api/errors";
import { OwnProfile } from "@/lib/types/user";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { LoadingState } from "@/components/ui/StatusMessage";
import { OnboardingStepper } from "@/components/onboarding/OnboardingStepper";
import { InterestPicker } from "@/components/onboarding/InterestPicker";

export default function OnboardingPage() {
  const { authReady, userId, profile, profileLoading } = useAppState();

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[520px] flex-col px-6 py-6">
      {!authReady || profileLoading ? (
        <LoadingState />
      ) : userId && profile ? (
        // Keyed so the form starts from the saved profile.
        <ProfileSteps key={profile.id} userId={userId} profile={profile} />
      ) : (
        <Welcome />
      )}
    </div>
  );
}

function Welcome() {
  const { t } = useAppState();

  return (
    <>
      <div className="flex justify-end">
        <LanguageToggle />
      </div>

      <div className="flex flex-1 flex-col justify-center py-8">
        <p className="eyebrow text-hearth-gold">{t("brandFull")}</p>
        <h1 className="display mt-3 text-[38px] leading-[1.05] text-hearth-ink">
          {t("welcomeTitle")}
        </h1>
        <p className="mt-4 text-[16px] leading-relaxed text-hearth-charcoal-soft">
          {t("welcomeBody")}
        </p>
      </div>

      <div className="space-y-3">
        <Link href="/signup" className="block">
          <Button size="lg" fullWidth>
            {t("createAccount")}
          </Button>
        </Link>
        <Link href="/login" className="block">
          <Button variant="outline" size="lg" fullWidth>
            {t("haveAccount")}
          </Button>
        </Link>
        <Link
          href="/events"
          className="block pt-1 text-center text-[14px] text-hearth-charcoal-soft hover:text-hearth-ember"
        >
          {t("justBrowsing")}
        </Link>
      </div>
    </>
  );
}

const STEPS = 3;

function ProfileSteps({ userId, profile }: { userId: string; profile: OwnProfile }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t, refreshProfile } = useAppState();
  const editing = Boolean(profile.onboardedAt);

  const [step, setStep] = useState(0);
  const [name, setName] = useState(profile.name);
  const [avatarPath, setAvatarPath] = useState(profile.avatarPath);
  const [interestIds, setInterestIds] = useState(profile.interestIds);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  async function handlePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      setAvatarPath(await uploadAvatar(userId, file));
    } catch (uploadError) {
      setError(uploadError);
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      await saveProfile(
        userId,
        { name: name.trim(), bio: profile.bio, avatarPath, interestIds },
        profile
      );
      await refreshProfile();
      // Names and photos appear on events, clubs and chats.
      await queryClient.invalidateQueries();
      if (editing) {
        router.push("/profile");
      } else {
        setStep(2);
      }
    } catch (saveError) {
      setError(saveError);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <OnboardingStepper step={step} total={STEPS} />
        <LanguageToggle />
      </div>

      <div className="flex flex-1 flex-col justify-center py-8">
        {step === 0 && (
          <div>
            <h1 className="display text-[30px] leading-tight text-hearth-ink">{t("yourName")}</h1>
            <p className="mt-2 text-[15px] text-hearth-charcoal-soft">{t("yourNameHint")}</p>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={60}
              autoComplete="name"
              placeholder={t("namePlaceholder")}
              className="mt-6 w-full rounded-pill border border-hearth-ink/12 bg-hearth-paper px-5 py-3 text-[16px] text-hearth-ink placeholder:text-hearth-charcoal-soft/70 focus:border-hearth-ember focus:outline-none"
            />

            <p className="eyebrow mt-8 text-hearth-charcoal-soft">{t("pickAvatar")}</p>
            <div className="mt-3 flex items-center gap-4">
              <Avatar name={name} src={avatarUrl(avatarPath)} size="lg" />
              <div className="flex flex-col items-start gap-1">
                <input
                  ref={fileInput}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhoto}
                />
                <Button
                  variant="outline"
                  size="sm"
                  disabled={uploading}
                  onClick={() => fileInput.current?.click()}
                >
                  {uploading ? t("uploading") : avatarPath ? t("changePhoto") : t("uploadPhoto")}
                </Button>
                {avatarPath && !uploading && (
                  <button
                    type="button"
                    onClick={() => setAvatarPath(undefined)}
                    className="pl-1 text-[13px] text-hearth-charcoal-soft hover:text-hearth-ember"
                  >
                    {t("removePhoto")}
                  </button>
                )}
                <span className="pl-1 text-[12px] text-hearth-charcoal-soft">{t("photoHint")}</span>
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <h1 className="display text-[30px] leading-tight text-hearth-ink">
              {t("interestsTitle")}
            </h1>
            <p className="mt-2 text-[15px] text-hearth-charcoal-soft">{t("interestsHint")}</p>
            <div className="mt-6">
              <InterestPicker selected={interestIds} onChange={setInterestIds} />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="text-center">
            <div className="mx-auto flex justify-center">
              <Avatar name={name} src={avatarUrl(avatarPath)} size="lg" />
            </div>
            <h1 className="display mt-6 text-[32px] leading-tight text-hearth-ink">{t("allSet")}</h1>
            <p className="mt-3 text-[15px] leading-relaxed text-hearth-charcoal-soft">
              {t("allSetBody")}
            </p>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {error !== null && (
          <p role="alert" className="text-center text-[13px] text-hearth-ember">
            {t(errorKey(error))}
          </p>
        )}

        {step === 0 && (
          <div className="flex gap-3">
            {editing && (
              <Button variant="outline" size="lg" onClick={() => router.push("/profile")}>
                {t("back")}
              </Button>
            )}
            <Button
              size="lg"
              fullWidth
              disabled={!name.trim() || uploading}
              onClick={() => setStep(1)}
            >
              {t("continue")}
            </Button>
          </div>
        )}

        {step === 1 && (
          <div className="flex gap-3">
            <Button variant="outline" size="lg" onClick={() => setStep(0)}>
              {t("back")}
            </Button>
            <Button
              size="lg"
              fullWidth
              disabled={interestIds.length === 0 || saving}
              onClick={save}
            >
              {saving ? t("saving") : editing ? t("saveChanges") : t("continue")}
            </Button>
          </div>
        )}

        {step === 2 && (
          <Button size="lg" fullWidth onClick={() => router.push("/events")}>
            {t("finish")}
          </Button>
        )}
      </div>
    </>
  );
}
