"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ChipProps {
  children: ReactNode;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

export function Chip({ children, selected = false, onClick, className }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "whitespace-nowrap rounded-pill border px-4 py-2 text-sm font-medium transition-colors",
        selected
          ? "border-hearth-ember bg-hearth-ember text-hearth-cream"
          : "border-hearth-clay/25 bg-white text-hearth-charcoal-soft hover:border-hearth-ember/50",
        className
      )}
    >
      {children}
    </button>
  );
}
