import { ReactNode } from "react";
import Link from "next/link";

interface TopBarProps {
  title: string;
  subtitle?: string;
  backHref?: string;
  action?: ReactNode;
  large?: boolean;
}

export function TopBar({
  title,
  subtitle,
  backHref,
  action,
  large = false,
}: TopBarProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-hearth-ink/10 bg-hearth-cream/95 backdrop-blur">
      <div className="flex items-center gap-3 px-5 py-3.5">
        {backHref && (
          <Link
            href={backHref}
            aria-label="Back"
            className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full text-hearth-ink hover:bg-hearth-cream-dark"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </Link>
        )}
        <div className="min-w-0 flex-1">
          <h1
            className={
              large
                ? "display truncate text-[27px] text-hearth-ink"
                : "display truncate text-xl text-hearth-ink"
            }
          >
            {title}
          </h1>
          {subtitle && (
            <p className="mt-0.5 truncate text-[13px] text-hearth-charcoal-soft">
              {subtitle}
            </p>
          )}
        </div>
        {action}
      </div>
    </header>
  );
}
