import { Avatar } from "@/components/ui/Avatar";
import { Profile } from "@/lib/types/user";

interface AttendeeAvatarStackProps {
  people: Profile[];
  max?: number;
  size?: "xs" | "sm" | "md";
}

export function AttendeeAvatarStack({ people, max = 4, size = "xs" }: AttendeeAvatarStackProps) {
  const shown = people.slice(0, max);
  const extra = people.length - shown.length;

  return (
    <div className="flex items-center">
      <div className="flex -space-x-2">
        {shown.map((person) => (
          <Avatar key={person.id} name={person.name} src={person.avatarUrl} size={size} />
        ))}
      </div>
      {extra > 0 && <span className="ml-1.5 text-xs text-hearth-charcoal-soft">+{extra}</span>}
    </div>
  );
}
