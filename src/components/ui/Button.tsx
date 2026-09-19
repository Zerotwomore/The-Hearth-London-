"use client";

import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "success" | "ink";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary: "bg-hearth-ember text-hearth-paper hover:bg-hearth-ember-light",
  ink: "bg-hearth-ink text-hearth-paper hover:bg-hearth-charcoal",
  secondary:
    "bg-hearth-cream-dark text-hearth-ink hover:bg-hearth-cream-dark/70",
  outline:
    "border border-hearth-ink/25 text-hearth-ink bg-transparent hover:border-hearth-ink/60",
  ghost: "text-hearth-charcoal-soft hover:bg-hearth-cream-dark/60",
  success: "bg-hearth-success text-hearth-paper hover:bg-hearth-success/90",
};

const sizeClasses: Record<Size, string> = {
  sm: "text-sm px-3.5 py-1.5",
  md: "text-[15px] px-5 py-2.5",
  lg: "text-base px-6 py-3.5",
};

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "rounded-pill font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && "w-full",
        className
      )}
      {...props}
    />
  );
}
