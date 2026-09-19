import { cn } from "@/lib/utils";

export function OnboardingStepper({
  step,
  total,
}: {
  step: number;
  total: number;
}) {
  return (
    <div className="flex items-center gap-1.5" aria-label={`Step ${step + 1} of ${total}`}>
      {Array.from({ length: total }).map((_, index) => (
        <span
          key={index}
          className={cn(
            "h-1 rounded-pill transition-all duration-300",
            index === step
              ? "w-6 bg-hearth-ember"
              : index < step
                ? "w-3 bg-hearth-gold"
                : "w-3 bg-hearth-ink/15"
          )}
        />
      ))}
    </div>
  );
}
