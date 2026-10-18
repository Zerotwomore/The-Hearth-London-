import { InputHTMLAttributes } from "react";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
}

export function TextField({ label, hint, ...props }: TextFieldProps) {
  return (
    <label className="block">
      <span className="eyebrow text-hearth-charcoal-soft">{label}</span>
      <input
        {...props}
        className="mt-1.5 w-full rounded-pill border border-hearth-ink/12 bg-hearth-paper px-5 py-3 text-[16px] text-hearth-ink focus:border-hearth-ember focus:outline-none"
      />
      {hint && <span className="mt-1 block pl-5 text-[12px] text-hearth-charcoal-soft">{hint}</span>}
    </label>
  );
}
