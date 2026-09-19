import { Lang } from "@/lib/types/i18n";

type ClassValue = string | false | null | undefined;

export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(" ");
}

function locale(lang: Lang): string {
  return lang === "zh" ? "zh-CN" : "en-GB";
}

export function formatEventDateTime(iso: string, lang: Lang = "en"): string {
  const date = new Date(iso);
  const dateLabel = date.toLocaleDateString(locale(lang), {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  const timeLabel = date.toLocaleTimeString(locale(lang), {
    hour: "numeric",
    minute: "2-digit",
    hour12: false,
  });
  return `${dateLabel} · ${timeLabel}`;
}

export function formatTimeRange(
  startIso: string,
  endIso: string | undefined,
  lang: Lang = "en"
): string {
  const start = new Date(startIso);
  const startLabel = start.toLocaleTimeString(locale(lang), {
    hour: "numeric",
    minute: "2-digit",
    hour12: false,
  });
  if (!endIso) return startLabel;
  const endLabel = new Date(endIso).toLocaleTimeString(locale(lang), {
    hour: "numeric",
    minute: "2-digit",
    hour12: false,
  });
  return `${startLabel} – ${endLabel}`;
}

export function formatFullDate(iso: string, lang: Lang = "en"): string {
  return new Date(iso).toLocaleDateString(locale(lang), {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function formatMessageTime(iso: string, lang: Lang = "en"): string {
  return new Date(iso).toLocaleTimeString(locale(lang), {
    hour: "numeric",
    minute: "2-digit",
    hour12: false,
  });
}

export function formatPostDate(iso: string, lang: Lang = "en"): string {
  return new Date(iso).toLocaleDateString(locale(lang), {
    day: "numeric",
    month: "short",
  });
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
