import { cn } from "@/lib/utils";

type Size = "sm" | "md";

const sizePx: Record<Size, number> = { sm: 14, md: 17 };

/** Verified member tick — hosts and confirmed accounts. */
export function VerifiedBadge({
  size = "sm",
  className,
  label = "Verified",
}: {
  size?: Size;
  className?: string;
  label?: string;
}) {
  const px = sizePx[size];

  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 24 24"
      role="img"
      aria-label={label}
      className={cn("inline-block shrink-0 align-[-2px]", className)}
    >
      <path
        fill="#c1502e"
        d="M12 1.5l2.6 2.02 3.28-.24.9 3.17 2.72 1.85-1.4 2.98 1.4 2.98-2.72 1.85-.9 3.17-3.28-.24L12 22.5l-2.6-2.02-3.28.24-.9-3.17-2.72-1.85 1.4-2.98-1.4-2.98 2.72-1.85.9-3.17 3.28.24z"
      />
      <path
        fill="none"
        stroke="#fffdfa"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 12.2l2.7 2.7L16 9.6"
      />
    </svg>
  );
}
