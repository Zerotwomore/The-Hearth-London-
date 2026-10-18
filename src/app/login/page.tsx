"use client";

import Link from "next/link";
import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppState } from "@/lib/context/AppStateContext";
import { resendConfirmation, signIn } from "@/lib/api/auth";
import { errorKey } from "@/lib/api/errors";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { AuthShell, FormError } from "@/components/auth/AuthShell";

/** Only follow same-site paths, so a crafted link can't send people elsewhere. */
function safeNext(value: string | null): string {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/";
}

function LoginForm() {
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));
  const { t } = useAppState();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unconfirmed, setUnconfirmed] = useState(false);
  const [resent, setResent] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setUnconfirmed(false);
    try {
      await signIn(email.trim(), password);
      // "/" sends members who haven't finished onboarding there first.
      router.replace(next);
    } catch (signInError) {
      const key = errorKey(signInError);
      setUnconfirmed(key === "errorEmailNotConfirmed");
      setError(t(key));
    } finally {
      setBusy(false);
    }
  }

  async function handleResend() {
    try {
      await resendConfirmation(email.trim());
      setResent(true);
    } catch (resendError) {
      setError(t(errorKey(resendError)));
    }
  }

  return (
    <AuthShell
      title={t("logIn")}
      footer={
        <p className="text-center text-[14px] text-hearth-charcoal-soft">
          {t("noAccount")}{" "}
          <Link href="/signup" className="font-medium text-hearth-ember hover:underline">
            {t("signUp")}
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <TextField
          label={t("email")}
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <TextField
          label={t("password")}
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <div className="text-right">
          <Link
            href="/forgot-password"
            className="text-[13px] text-hearth-charcoal-soft hover:text-hearth-ember"
          >
            {t("forgotPassword")}
          </Link>
        </div>
        <div className="pt-2">
          <Button type="submit" size="lg" fullWidth disabled={busy}>
            {t("logIn")}
          </Button>
        </div>
        <FormError message={error} />
        {unconfirmed && (
          <div className="text-center">
            {resent ? (
              <p className="text-[14px] text-hearth-success">{t("emailResent")}</p>
            ) : (
              <Button type="button" variant="outline" size="sm" onClick={handleResend}>
                {t("resendEmail")}
              </Button>
            )}
          </div>
        )}
      </form>
    </AuthShell>
  );
}

export default function LoginPage() {
  // useSearchParams needs a Suspense boundary so the page can still be prerendered.
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
