"use client";

import { useAppState } from "@/lib/context/AppStateContext";
import { Button } from "@/components/ui/Button";

/** Centred note for loading, empty and not-found states. */
export function StatusMessage({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-5 py-12 text-center text-[15px] text-hearth-charcoal-soft">{children}</p>
  );
}

export function LoadingState() {
  const { t } = useAppState();
  return <StatusMessage>{t("loading")}</StatusMessage>;
}

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  const { t } = useAppState();
  return (
    <div className="px-5 py-12 text-center">
      <p className="text-[15px] text-hearth-charcoal-soft">{t("errorLoading")}</p>
      <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
        {t("retry")}
      </Button>
    </div>
  );
}
