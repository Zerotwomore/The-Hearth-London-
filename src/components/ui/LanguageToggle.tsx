"use client";

import { useAppState } from "@/lib/context/AppStateContext";
import { cn } from "@/lib/utils";

export function LanguageToggle({ className }: { className?: string }) {
  const { lang, setLang } = useAppState();

  return (
    <div
      className={cn(
        "relative inline-flex items-center rounded-pill border border-hearth-ink/15 bg-hearth-paper p-0.5",
        className
      )}
      role="group"
      aria-label="Language"
    >
      <span
        aria-hidden
        className={cn(
          "absolute top-0.5 bottom-0.5 w-1/2 rounded-pill bg-hearth-ink transition-transform duration-200 ease-out",
          lang === "zh" && "translate-x-full"
        )}
        style={{ left: "2px", width: "calc(50% - 2px)" }}
      />
      <button
        type="button"
        onClick={() => setLang("en")}
        aria-pressed={lang === "en"}
        className={cn(
          "relative z-10 w-11 rounded-pill py-1 text-xs font-semibold tracking-wide transition-colors",
          lang === "en" ? "text-hearth-paper" : "text-hearth-charcoal-soft"
        )}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLang("zh")}
        aria-pressed={lang === "zh"}
        className={cn(
          "relative z-10 w-11 rounded-pill py-1 text-xs font-semibold transition-colors",
          lang === "zh" ? "text-hearth-paper" : "text-hearth-charcoal-soft"
        )}
      >
        中文
      </button>
    </div>
  );
}
