"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAppState } from "@/lib/context/AppStateContext";
import { Button } from "@/components/ui/Button";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { SsoButtons } from "@/components/auth/SsoButtons";

export default function SignupPage() {
  const router = useRouter();
  const { t } = useAppState();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[520px] flex-col px-6 py-6">
      <div className="flex items-center justify-between">
        <Link
          href="/onboarding"
          className="eyebrow text-hearth-charcoal-soft hover:text-hearth-ember"
        >
          {t("back")}
        </Link>
        <LanguageToggle />
      </div>

      <div className="flex flex-1 flex-col justify-center py-10">
        <p className="eyebrow text-hearth-gold">
          {t("brandFull")}
        </p>
        <h1 className="display mt-3 text-[34px] leading-tight text-hearth-ink">
          {t("signUp")}
        </h1>

        <div className="mt-8">
          <SsoButtons />
        </div>

        <div className="my-7 flex items-center gap-4">
          <span className="h-px flex-1 bg-hearth-ink/12" />
          <span className="text-[12px] uppercase tracking-widest text-hearth-charcoal-soft">
            {t("orDivider")}
          </span>
          <span className="h-px flex-1 bg-hearth-ink/12" />
        </div>

        <div className="space-y-3">
          <label className="block">
            <span className="eyebrow text-hearth-charcoal-soft">{t("email")}</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1.5 w-full rounded-pill border border-hearth-ink/12 bg-hearth-paper px-5 py-3 text-[16px] text-hearth-ink focus:border-hearth-ember focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="eyebrow text-hearth-charcoal-soft">
              {t("password")}
            </span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1.5 w-full rounded-pill border border-hearth-ink/12 bg-hearth-paper px-5 py-3 text-[16px] text-hearth-ink focus:border-hearth-ember focus:outline-none"
            />
          </label>
        </div>
      </div>

      <div className="space-y-3">
        <Button size="lg" fullWidth onClick={() => router.push("/onboarding")}>
          {t("continue")}
        </Button>
        <p className="text-center text-[14px] text-hearth-charcoal-soft">
          {t("hasAccount")}{" "}
          <Link href="/login" className="font-medium text-hearth-ember hover:underline">
            {t("logIn")}
          </Link>
        </p>
      </div>
    </div>
  );
}
