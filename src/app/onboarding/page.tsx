"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAppState } from "@/lib/context/AppStateContext";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { OnboardingStepper } from "@/components/onboarding/OnboardingStepper";
import { InterestPicker } from "@/components/onboarding/InterestPicker";
import { SsoButtons } from "@/components/auth/SsoButtons";
import { cn } from "@/lib/utils";

// The first five also form the fan on the welcome screen.
const AVATAR_CHOICES = [
  "https://randomuser.me/api/portraits/women/90.jpg",
  "/paddington.svg",
  "https://randomuser.me/api/portraits/men/4.jpg",
  "/airplane.svg",
  "https://randomuser.me/api/portraits/women/85.jpg",
  "https://randomuser.me/api/portraits/women/70.jpg",
  "https://randomuser.me/api/portraits/women/44.jpg",
  "https://i.pravatar.cc/150?img=51",
];

const TOTAL_STEPS = 4;

export default function OnboardingPage() {
  const router = useRouter();
  const { t, profileDraft, selectedInterestIds, completeOnboarding } =
    useAppState();

  const [step, setStep] = useState(0);
  const [name, setName] = useState(profileDraft.name);
  const [avatarUrl, setAvatarUrl] = useState(profileDraft.avatarUrl);

  function finish() {
    completeOnboarding({ name: name.trim() || "Guest", avatarUrl, bio: profileDraft.bio });
    router.push("/events");
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[520px] flex-col px-6 py-6">
      <div className="flex items-center justify-between">
        <OnboardingStepper step={step} total={TOTAL_STEPS} />
        <LanguageToggle />
      </div>

      <div className="flex flex-1 flex-col justify-center py-8">
        {step === 0 && (
          <div>
            <p className="eyebrow text-hearth-gold">
              {t("brandFull")}
            </p>
            <h1 className="display mt-3 text-[38px] leading-[1.05] text-hearth-ink">
              {t("welcomeTitle")}
            </h1>
            <p className="mt-4 text-[16px] leading-relaxed text-hearth-charcoal-soft">
              {t("welcomeBody")}
            </p>
            <div className="mt-8 flex gap-2">
              {AVATAR_CHOICES.slice(0, 5).map((src, index) => (
                <span
                  key={src}
                  className={cn("inline-block", index > 0 && "-ml-4")}
                  style={{ transform: `rotate(${(index - 2) * 4}deg)` }}
                >
                  <Avatar name="" src={src} size="md" />
                </span>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <h1 className="display text-[30px] leading-tight text-hearth-ink">
              {t("yourName")}
            </h1>
            <p className="mt-2 text-[15px] text-hearth-charcoal-soft">
              {t("yourNameHint")}
            </p>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={t("namePlaceholder")}
              className="mt-6 w-full rounded-pill border border-hearth-ink/12 bg-hearth-paper px-5 py-3 text-[16px] text-hearth-ink placeholder:text-hearth-charcoal-soft/70 focus:border-hearth-ember focus:outline-none"
            />

            <p className="eyebrow mt-8 text-hearth-charcoal-soft">
              {t("pickAvatar")}
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              {AVATAR_CHOICES.map((src) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setAvatarUrl(src)}
                  className={cn(
                    "rounded-full transition-all",
                    avatarUrl === src
                      ? "ring-2 ring-hearth-ember ring-offset-2 ring-offset-hearth-cream"
                      : "opacity-70 hover:opacity-100"
                  )}
                >
                  <Avatar name="" src={src} size="md" />
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h1 className="display text-[30px] leading-tight text-hearth-ink">
              {t("interestsTitle")}
            </h1>
            <p className="mt-2 text-[15px] text-hearth-charcoal-soft">
              {t("interestsHint")}
            </p>
            <div className="mt-6">
              <InterestPicker />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="text-center">
            <div className="mx-auto flex justify-center">
              <Avatar name={name} src={avatarUrl} size="lg" />
            </div>
            <h1 className="display mt-6 text-[32px] leading-tight text-hearth-ink">
              {t("allSet")}
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-hearth-charcoal-soft">
              {t("allSetBody")}
            </p>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {step === 0 && (
          <>
            <SsoButtons />
            <div className="flex items-center gap-4 py-1">
              <span className="h-px flex-1 bg-hearth-ink/12" />
              <span className="text-[12px] uppercase tracking-widest text-hearth-charcoal-soft">
                {t("orDivider")}
              </span>
              <span className="h-px flex-1 bg-hearth-ink/12" />
            </div>
            <Button variant="outline" size="lg" fullWidth onClick={() => setStep(1)}>
              {t("getStarted")}
            </Button>
            <Link
              href="/login"
              className="block text-center text-[14px] text-hearth-charcoal-soft hover:text-hearth-ember"
            >
              {t("haveAccount")}
            </Link>
          </>
        )}

        {step > 0 && step < 3 && (
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setStep((prev) => prev - 1)}
            >
              {t("back")}
            </Button>
            <Button
              size="lg"
              fullWidth
              disabled={
                (step === 1 && !name.trim()) ||
                (step === 2 && selectedInterestIds.length === 0)
              }
              onClick={() => setStep((prev) => prev + 1)}
            >
              {t("continue")}
            </Button>
          </div>
        )}

        {step === 3 && (
          <Button size="lg" fullWidth onClick={finish}>
            {t("finish")}
          </Button>
        )}
      </div>
    </div>
  );
}
