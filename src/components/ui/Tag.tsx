import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Tag({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-pill bg-hearth-cream-dark px-2.5 py-1 text-xs font-medium text-hearth-clay",
        className
      )}
    >
      {children}
    </span>
  );
}
