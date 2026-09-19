import { Avatar } from "@/components/ui/Avatar";
import { getUserById } from "@/lib/data/users";

interface AttendeeAvatarStackProps {
  attendeeIds: string[];
  max?: number;
  size?: "xs" | "sm" | "md";
}

export function AttendeeAvatarStack({
  attendeeIds,
  max = 4,
  size = "xs",
}: AttendeeAvatarStackProps) {
  const shown = attendeeIds.slice(0, max);
  const extra = attendeeIds.length - shown.length;

  return (
    <div className="flex items-center">
      <div className="flex -space-x-2">
        {shown.map((id) => {
          const user = getUserById(id);
          if (!user) return null;
          return (
            <Avatar key={id} name={user.name} src={user.avatarUrl} size={size} />
          );
        })}
      </div>
      {extra > 0 && (
        <span className="ml-1.5 text-xs text-hearth-charcoal-soft">+{extra}</span>
      )}
    </div>
  );
}
