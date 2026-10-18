import { cn, initials } from "@/lib/utils";

type Size = "xs" | "sm" | "md" | "lg";

const sizeClasses: Record<Size, string> = {
  xs: "w-7 h-7 text-[10px]",
  sm: "w-9 h-9 text-xs",
  md: "w-12 h-12 text-sm",
  lg: "w-20 h-20 text-xl",
};

interface AvatarProps {
  name: string;
  src?: string;
  size?: Size;
  className?: string;
}

export function Avatar({ name, src, size = "md", className }: AvatarProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-hearth-amber text-hearth-cream font-semibold overflow-hidden shrink-0 ring-2 ring-hearth-cream",
        sizeClasses[size],
        className
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        initials(name)
      )}
    </span>
  );
}
