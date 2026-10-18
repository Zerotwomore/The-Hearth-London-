"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/lib/context/AppStateContext";
import { MIN_PASSWORD_LENGTH, resendConfirmation, signUp } from "@/lib/api/auth";
import { errorKey } from "@/lib/api/errors";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { AuthShell, FormError } from "@/components/auth/AuthShell";

export default function SignupPage() {
  const router = useRouter();
  const { t } = useAppState();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [resent, setResent] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const signedIn = await signUp(email.trim(), password);
      if (signedIn) router.push("/onboarding");
      else setSentTo(email.trim());
    } catch (signUpError) {
      setError(t(errorKey(signUpError)));
    } finally {
      setBusy(false);
    }
  }

  async function handleResend() {
    if (!sentTo) return;
    setError(null);
    try {
      await resendConfirmation(sentTo);
      setResent(true);
    } catch (resendError) {
      setError(t(errorKey(resendError)));
    }
  }

  if (sentTo) {
    return (
      <AuthShell title={t("checkEmailTitle")} intro={t("checkEmailBody")}>
        <p className="rounded-card border border-hearth-ink/10 bg-hearth-paper px-5 py-4 text-center text-[16px] font-medium text-hearth-ink">
          {sentTo}
        </p>
        <div className="mt-6 space-y-3 text-center">
          {resent ? (
            <p className="text-[14px] text-hearth-success">{t("emailResent")}</p>
          ) : (
            <Button variant="outline" size="md" onClick={handleResend}>
              {t("resendEmail")}
            </Button>
          )}
          <FormError message={error} />
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title={t("signUp")}
      footer={
        <p className="text-center text-[14px] text-hearth-charcoal-soft">
          {t("hasAccount")}{" "}
          <Link href="/login" className="font-medium text-hearth-ember hover:underline">
            {t("logIn")}
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
          hint={t("passwordHint")}
          type="password"
          autoComplete="new-password"
          required
          minLength={MIN_PASSWORD_LENGTH}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <div className="pt-3">
          <Button type="submit" size="lg" fullWidth disabled={busy}>
            {t("createAccount")}
          </Button>
        </div>
        <FormError message={error} />
      </form>
    </AuthShell>
  );
}
