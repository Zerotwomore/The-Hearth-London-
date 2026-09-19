import { cn } from "@/lib/utils";

/** Gold VIP marker — used on member profiles and members-only events. */
export function VipBadge({
  label = "VIP",
  className,
  solid = false,
}: {
  label?: string;
  className?: string;
  solid?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-pill px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]",
        solid
          ? "bg-hearth-gold text-hearth-ink"
          : "border border-hearth-gold/60 bg-hearth-gold/12 text-hearth-gold",
        className
      )}
    >
      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M3 7l4.5 3.2L12 4l4.5 6.2L21 7l-1.8 12H4.8L3 7z" />
      </svg>
      {label}
    </span>
  );
}
