import { LocalizedText } from "@/lib/types/i18n";

export interface Interest {
  id: string;
  label: LocalizedText;
}

export const INTERESTS: Interest[] = [
  { id: "art-culture", label: { en: "Art & Galleries", zh: "艺术与展览" } },
  { id: "reading", label: { en: "Reading Group", zh: "读书会" } },
  { id: "food-drink", label: { en: "Food & Drink", zh: "美食与酒" } },
  { id: "hiking", label: { en: "Walks & Hikes", zh: "徒步散步" } },
  { id: "board-games", label: { en: "Board Games", zh: "桌游" } },
  { id: "live-music", label: { en: "Live Music", zh: "现场音乐" } },
  { id: "language-exchange", label: { en: "Language Exchange", zh: "语言交换" } },
  { id: "photography", label: { en: "Photography", zh: "摄影" } },
  { id: "cycling", label: { en: "Cycling", zh: "骑行" } },
  { id: "wine-tasting", label: { en: "Wine Tasting", zh: "品酒" } },
  { id: "running", label: { en: "Running", zh: "跑步" } },
  { id: "pub-quiz", label: { en: "Pub Quiz", zh: "酒吧问答" } },
];

export function getInterest(id: string): Interest | undefined {
  return INTERESTS.find((interest) => interest.id === id);
}
