"use client";

import { Chip } from "@/components/ui/Chip";
import { useInterests } from "@/lib/api/profile";
import { useAppState } from "@/lib/context/AppStateContext";

interface InterestPickerProps {
  selected: string[];
  onChange: (selected: string[]) => void;
}

export function InterestPicker({ selected, onChange }: InterestPickerProps) {
  const { t, tx } = useAppState();
  const { data: interests, isPending } = useInterests();

  if (isPending) {
    return <p className="text-[14px] text-hearth-charcoal-soft">{t("loading")}</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {(interests ?? []).map((interest) => (
        <Chip
          key={interest.id}
          selected={selected.includes(interest.id)}
          onClick={() =>
            onChange(
              selected.includes(interest.id)
                ? selected.filter((id) => id !== interest.id)
                : [...selected, interest.id]
            )
          }
        >
          {tx(interest.label)}
        </Chip>
      ))}
    </div>
  );
}
