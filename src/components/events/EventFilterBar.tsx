"use client";

import { Chip } from "@/components/ui/Chip";
import { useCategories } from "@/lib/api/events";
import { useAppState } from "@/lib/context/AppStateContext";

interface EventFilterBarProps {
  active: string | "all";
  onChange: (categoryId: string | "all") => void;
}

export function EventFilterBar({ active, onChange }: EventFilterBarProps) {
  const { t, tx } = useAppState();
  const { data: categories = [] } = useCategories();

  return (
    <div className="no-scrollbar -mx-5 overflow-x-auto px-5">
      <div className="flex gap-2 pb-1">
        <Chip selected={active === "all"} onClick={() => onChange("all")}>
          {t("allCategories")}
        </Chip>
        {categories.map((category) => (
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
