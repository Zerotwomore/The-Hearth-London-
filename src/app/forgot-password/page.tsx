"use client";

import { FormEvent, useState } from "react";
import { useAppState } from "@/lib/context/AppStateContext";
import { sendPasswordReset } from "@/lib/api/auth";
import { errorKey } from "@/lib/api/errors";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { AuthShell, FormError } from "@/components/auth/AuthShell";

export default function ForgotPasswordPage() {
  const { t } = useAppState();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await sendPasswordReset(email.trim());
      setSent(true);
    } catch (resetError) {
      setError(t(errorKey(resetError)));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell title={t("resetTitle")} intro={sent ? undefined : t("resetBody")} backHref="/login">
      {sent ? (
        <p className="rounded-card border border-hearth-ink/10 bg-hearth-paper px-5 py-4 text-[15px] leading-relaxed text-hearth-charcoal">
          {t("resetSent")}
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <TextField
            label={t("email")}
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <div className="pt-3">
            <Button type="submit" size="lg" fullWidth disabled={busy}>
              {t("sendResetLink")}
            </Button>
          </div>
          <FormError message={error} />
        </form>
      )}
    </AuthShell>
  );
}
