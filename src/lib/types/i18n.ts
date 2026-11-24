export type Lang = "en" | "zh";

export interface LocalizedText {
  en: string;
  zh: string;
}

/** UI text (categories, labels) in the chosen language. */
export function pick(text: LocalizedText, lang: Lang): string {
  return text[lang] || text.en;
}

/**
 * Text someone posted (an event's title, venue or description, a club's
 * name), exactly as written. The EN / 中文 toggle only changes the UI, so
 * posted content shows the same in both languages. It's stored in `en`
 * (member-hosted events leave `zh` empty).
 */
export function original(text: LocalizedText): string {
  return text.en || text.zh;
}
