"use client";

import { Chip } from "@/components/ui/Chip";
import { CATEGORIES } from "@/lib/data/categories";
import { useAppState } from "@/lib/context/AppStateContext";
import { EventCategory } from "@/lib/types/event";

interface EventFilterBarProps {
  active: EventCategory | "all";
  onChange: (category: EventCategory | "all") => void;
}

export function EventFilterBar({ active, onChange }: EventFilterBarProps) {
  const { t, tx } = useAppState();

  return (
    <div className="no-scrollbar -mx-5 overflow-x-auto px-5">
      <div className="flex gap-2 pb-1">
        <Chip selected={active === "all"} onClick={() => onChange("all")}>
          {t("allCategories")}
        </Chip>
        {CATEGORIES.map((category) => (
          <Chip
            key={category.id}
            selected={active === category.id}
            onClick={() => onChange(category.id)}
          >
            {tx(category.label)}
          </Chip>
        ))}
      </div>
    </div>
  );
}
