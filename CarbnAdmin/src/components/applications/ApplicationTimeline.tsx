import { formatDate } from "../../utils/formatDate";
import type { ApplicationActivity } from "../../types/application";
import { cn } from "../../lib/utils";

const actionLabels: Record<string, string> = {
  created: "Application created",
  email_verified: "Email verified",
  registration_completed: "Registration completed",
  approved: "Application approved",
  invited: "Invitation sent",
  activated: "Beta access activated",
  declined: "Application declined",
  suspended: "Account suspended",
  completed: "Beta completed",
  status_updated: "Status updated",
  invitation_resent: "Invitation resent",
};

interface ApplicationTimelineProps {
  activity: ApplicationActivity[];
}

export default function ApplicationTimeline({ activity }: ApplicationTimelineProps) {
  if (!activity || activity.length === 0) {
    return (
      <p className="text-sm text-[hsl(var(--muted-foreground))] text-center py-6">
        No activity recorded yet.
      </p>
    );
  }

  const sorted = [...activity].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div className="relative space-y-0">
      {sorted.map((item, index) => (
        <div key={item.id} className="flex gap-4">
          {/* Line + dot */}
          <div className="flex flex-col items-center">
            <div className={cn(
              "w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 ring-2 ring-[hsl(var(--card))]",
              index === 0 ? "bg-[hsl(var(--primary))]" : "bg-[hsl(var(--border))]"
            )} />
            {index < sorted.length - 1 && (
              <div className="w-px flex-1 bg-[hsl(var(--border))] my-1" />
            )}
          </div>

          {/* Content */}
          <div className={cn("pb-4 flex-1", index === sorted.length - 1 && "pb-0")}>
            <p className="text-sm font-medium text-[hsl(var(--foreground))]">
              {actionLabels[item.action] ?? item.action}
            </p>
            {item.new_status && (
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
                {item.previous_status && (
                  <span className="opacity-60">{item.previous_status} → </span>
                )}
                <span className="font-medium">{item.new_status}</span>
              </p>
            )}
            {item.notes && (
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1 italic">
                "{item.notes}"
              </p>
            )}
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1 opacity-60">
              {formatDate(item.created_at)}
              {item.performed_by && ` · ${item.performed_by}`}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
