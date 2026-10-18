"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/lib/context/AppStateContext";
import { MIN_PASSWORD_LENGTH, updatePassword } from "@/lib/api/auth";
import { errorKey } from "@/lib/api/errors";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { LoadingState } from "@/components/ui/StatusMessage";
import { AuthShell, FormError } from "@/components/auth/AuthShell";

/** Where the password reset email lands. The link signs the member in. */
export default function ResetPasswordPage() {
  const router = useRouter();
  const { t, authReady, userId } = useAppState();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await updatePassword(password);
      router.replace("/");
    } catch (updateError) {
      setError(t(errorKey(updateError)));
    } finally {
      setBusy(false);
    }
  }

  if (!authReady) {
    return <LoadingState />;
  }

  // No session means the link was expired, already used, or opened directly.
  if (!userId) {
    return (
      <AuthShell title={t("resetTitle")} backHref="/login">
        <p className="text-[15px] leading-relaxed text-hearth-charcoal">{t("resetLinkInvalid")}</p>
        <Link href="/forgot-password" className="mt-6 block">
          <Button size="lg" fullWidth>
            {t("sendResetLink")}
          </Button>
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell title={t("newPasswordTitle")} backHref="/">
      <form onSubmit={handleSubmit} className="space-y-3">
        <TextField
          label={t("newPassword")}
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
            {t("savePassword")}
          </Button>
        </div>
        <FormError message={error} />
      </form>
    </AuthShell>
  );
}
