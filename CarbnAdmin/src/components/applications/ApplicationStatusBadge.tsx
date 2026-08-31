import { cn } from "../../lib/utils";
import type { ApplicantStatus } from "../../types/application";

const statusConfig: Record<ApplicantStatus, { label: string; className: string }> = {
  pending: {
    label: "Pending",
    className: "bg-[hsl(var(--status-pending-bg))] text-[hsl(var(--status-pending))]",
  },
  approved: {
    label: "Approved",
    className: "bg-[hsl(var(--status-approved-bg))] text-[hsl(var(--status-approved))]",
  },
  declined: {
    label: "Declined",
    className: "bg-[hsl(var(--status-declined-bg))] text-[hsl(var(--status-declined))]",
  },
  active: {
    label: "Active",
    className: "bg-[hsl(var(--status-active-bg))] text-[hsl(var(--status-active))]",
  },
};

interface ApplicationStatusBadgeProps {
  status: ApplicantStatus;
  className?: string;
}

export default function ApplicationStatusBadge({
  status,
  className,
}: ApplicationStatusBadgeProps) {
  const config = statusConfig[status];

  if (!config) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
