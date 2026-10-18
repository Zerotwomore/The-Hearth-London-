"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppState } from "@/lib/context/AppStateContext";
import { Button } from "@/components/ui/Button";
import { StringKey } from "@/lib/i18n/strings";

/** Shown in place of member-only screens to signed-out visitors. */
export function SignInPrompt({ message }: { message: StringKey }) {
  const { t } = useAppState();
  const pathname = usePathname();

  return (
    <div className="px-5 py-14 text-center">
      <p className="text-[15px] text-hearth-charcoal-soft">{t(message)}</p>
      <div className="mx-auto mt-6 flex max-w-xs flex-col gap-3">
        <Link href={`/login?next=${encodeURIComponent(pathname)}`}>
          <Button size="md" fullWidth>
            {t("logIn")}
          </Button>
        </Link>
        <Link href="/signup">
          <Button variant="outline" size="md" fullWidth>
            {t("createAccount")}
          </Button>
        </Link>
      </div>
    </div>
  );
}
