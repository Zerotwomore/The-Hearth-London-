"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/lib/context/AppStateContext";
import { cn } from "@/lib/utils";

type Provider = "wechat" | "apple";

function WechatIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8.69 4C4.9 4 1.83 6.6 1.83 9.81c0 1.79.96 3.39 2.47 4.47l-.62 1.86 2.17-1.09c.77.21 1.59.33 2.44.33h.4a5.2 5.2 0 0 1-.15-1.24c0-3.02 2.94-5.47 6.57-5.47.24 0 .48.01.71.04C15.24 5.86 12.28 4 8.69 4Zm-2.3 3.36a.9.9 0 1 1 0 1.8.9.9 0 0 1 0-1.8Zm4.6 0a.9.9 0 1 1 0 1.8.9.9 0 0 1 0-1.8Z" />
      <path d="M22.17 14.14c0-2.65-2.6-4.8-5.8-4.8s-5.8 2.15-5.8 4.8 2.6 4.8 5.8 4.8c.7 0 1.38-.1 2.01-.28l1.83.92-.52-1.55c1.5-.88 2.48-2.28 2.48-3.89Zm-7.73-1.3a.76.76 0 1 1 0-1.52.76.76 0 0 1 0 1.52Zm3.86 0a.76.76 0 1 1 0-1.52.76.76 0 0 1 0 1.52Z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M16.36 12.72c-.02-2.3 1.88-3.4 1.96-3.46-1.07-1.56-2.73-1.78-3.32-1.8-1.41-.14-2.76.83-3.48.83-.72 0-1.83-.81-3.01-.79-1.55.02-2.98.9-3.78 2.29-1.61 2.8-.41 6.94 1.16 9.21.77 1.11 1.68 2.36 2.88 2.31 1.16-.05 1.6-.75 3-.75s1.79.75 3.01.72c1.24-.02 2.03-1.13 2.79-2.25.88-1.29 1.24-2.54 1.26-2.6-.03-.01-2.42-.93-2.44-3.71ZM14.1 5.6c.64-.77 1.07-1.85.95-2.92-.92.04-2.03.61-2.69 1.38-.59.68-1.11 1.78-.97 2.83 1.03.08 2.07-.52 2.71-1.29Z" />
    </svg>
  );
}

export function SsoButtons({ className }: { className?: string }) {
  const router = useRouter();
  const { t, signInAs } = useAppState();
  const [pending, setPending] = useState<Provider | null>(null);

  function handleSso(provider: Provider) {
    setPending(provider);
    // Prototype: simulate the redirect round-trip, sign in as the mock user,
    // then land in the app.
    window.setTimeout(() => {
      signInAs(provider);
      router.push("/events");
    }, 700);
  }

  return (
    <div className={cn("space-y-2.5", className)}>
      <p className="pb-1 text-center text-[13px] font-medium text-hearth-charcoal-soft">
        {t("ssoMockNote")}
      </p>

      <button
        type="button"
        onClick={() => handleSso("wechat")}
        disabled={pending !== null}
        className="flex w-full items-center justify-center gap-2.5 rounded-pill bg-[#07c160] px-5 py-3.5 text-[15px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        <WechatIcon />
        {pending === "wechat" ? t("connecting") : t("continueWithWechat")}
      </button>

      <button
        type="button"
        onClick={() => handleSso("apple")}
        disabled={pending !== null}
        className="flex w-full items-center justify-center gap-2.5 rounded-pill bg-hearth-ink px-5 py-3.5 text-[15px] font-medium text-hearth-paper transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        <AppleIcon />
        {pending === "apple" ? t("connecting") : t("continueWithApple")}
      </button>

      <p className="pt-1 text-center text-[13px] font-medium text-hearth-charcoal-soft">
        {t("ssoMockNote")}
      </p>
    </div>
  );
}
