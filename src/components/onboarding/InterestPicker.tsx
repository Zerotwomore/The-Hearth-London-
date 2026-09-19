"use client";

import { Chip } from "@/components/ui/Chip";
import { INTERESTS } from "@/lib/data/interests";
import { useAppState } from "@/lib/context/AppStateContext";

export function InterestPicker() {
  const { tx, selectedInterestIds, toggleInterest } = useAppState();

  return (
    <div className="flex flex-wrap gap-2">
      {INTERESTS.map((interest) => (
        <Chip
          key={interest.id}
          selected={selectedInterestIds.includes(interest.id)}
          onClick={() => toggleInterest(interest.id)}
        >
          {tx(interest.label)}
        </Chip>
      ))}
    </div>
  );
}
