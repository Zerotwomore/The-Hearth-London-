import Link from "next/link";

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  actionHref?: string;
}

export function SectionHeader({
  title,
  actionLabel,
  actionHref,
}: SectionHeaderProps) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-3">
      <h2 className="display text-lg text-hearth-ink">{title}</h2>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="text-[13px] font-medium text-hearth-ember hover:underline"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
