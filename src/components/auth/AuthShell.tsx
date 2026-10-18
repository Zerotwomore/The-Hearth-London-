"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { useAppState } from "@/lib/context/AppStateContext";
import { LanguageToggle } from "@/components/ui/LanguageToggle";

/** Frame for the sign-up, log-in and password screens. */
export function AuthShell({
  title,
  intro,
  backHref = "/onboarding",
  children,
  footer,
}: {
  title: string;
  intro?: string;
  backHref?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const { t } = useAppState();

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[520px] flex-col px-6 py-6">
      <div className="flex items-center justify-between">
        <Link href={backHref} className="eyebrow text-hearth-charcoal-soft hover:text-hearth-ember">
          {t("back")}
        </Link>
        <LanguageToggle />
      </div>

      <div className="flex flex-1 flex-col justify-center py-10">
        <p className="eyebrow text-hearth-gold">{t("brandFull")}</p>
        <h1 className="display mt-3 text-[34px] leading-tight text-hearth-ink">{title}</h1>
        {intro && <p className="mt-3 text-[15px] leading-relaxed text-hearth-charcoal-soft">{intro}</p>}
        <div className="mt-8">{children}</div>
      </div>

      {footer && <div className="space-y-3">{footer}</div>}
    </div>
  );
}

export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="text-center text-[13px] text-hearth-ember">
      {message}
    </p>
  );
}
