"use client";

import Link from "next/link";
import { useAppState } from "@/lib/context/AppStateContext";
import { Button } from "@/components/ui/Button";
import { StringKey } from "@/lib/i18n/strings";
import { loginHref } from "@/lib/routes";

/** Shown in place of member-only screens to signed-out visitors. */
export function SignInPrompt({ message }: { message: StringKey }) {
  const { t } = useAppState();

  return (
    <div className="px-5 py-14 text-center">
      <p className="text-[15px] text-hearth-charcoal-soft">{t(message)}</p>
      <div className="mx-auto mt-6 flex max-w-xs flex-col gap-3">
        <Button
          size="md"
          fullWidth
          // Read at click time so the ?id=… of the current page comes along.
          onClick={() =>
            window.location.assign(loginHref(window.location.pathname + window.location.search))
          }
        >
          {t("logIn")}
        </Button>
        <Link href="/signup">
          <Button variant="outline" size="md" fullWidth>
            {t("createAccount")}
          </Button>
        </Link>
      </div>
    </div>
  );
}
