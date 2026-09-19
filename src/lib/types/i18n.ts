export type Lang = "en" | "zh";

export interface LocalizedText {
  en: string;
  zh: string;
}

export function pick(text: LocalizedText, lang: Lang): string {
  return text[lang] || text.en;
}
