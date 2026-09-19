import { EventCategory } from "@/lib/types/event";
import { LocalizedText } from "@/lib/types/i18n";

export const CATEGORIES: { id: EventCategory; label: LocalizedText }[] = [
  { id: "art-culture", label: { en: "Art & Culture", zh: "艺术文化" } },
  { id: "reading", label: { en: "Reading", zh: "读书会" } },
  { id: "dinner", label: { en: "Dinner", zh: "晚餐" } },
  { id: "outdoors", label: { en: "Outdoors", zh: "户外" } },
  { id: "bar", label: { en: "Bar", zh: "酒吧" } },
  { id: "board-games", label: { en: "Board Games", zh: "桌游" } },
  { id: "live-event", label: { en: "Live", zh: "现场" } },
];

export function getCategoryLabel(id: EventCategory): LocalizedText {
  return (
    CATEGORIES.find((category) => category.id === id)?.label ?? {
      en: id,
      zh: id,
    }
  );
}
