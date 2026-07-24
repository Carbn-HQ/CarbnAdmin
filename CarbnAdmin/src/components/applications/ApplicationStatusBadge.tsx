import { cn } from "../../lib/utils";
import type { BetaStatus, RegistrationStatus } from "../../types/application";

const betaStatusConfig: Record<BetaStatus, { label: string; className: string }> = {
  pending_review: {
    label: "Pending Review",
    className: "bg-[hsl(var(--status-pending-bg))] text-[hsl(var(--status-pending))]",
  },
  approved: {
    label: "Approved",
    className: "bg-[hsl(var(--status-approved-bg))] text-[hsl(var(--status-approved))]",
  },
  invited: {
    label: "Invited",
    className: "bg-[hsl(var(--status-invited-bg))] text-[hsl(var(--status-invited))]",
  },
  active: {
    label: "Active",
    className: "bg-[hsl(var(--status-active-bg))] text-[hsl(var(--status-active))]",
  },
  declined: {
    label: "Declined",
    className: "bg-[hsl(var(--status-declined-bg))] text-[hsl(var(--status-declined))]",
  },
  suspended: {
    label: "Suspended",
    className: "bg-[hsl(var(--status-suspended-bg))] text-[hsl(var(--status-suspended))]",
  },
  completed: {
    label: "Completed",
    className: "bg-[hsl(var(--status-completed-bg))] text-[hsl(var(--status-completed))]",
  },
};

const regStatusConfig: Record<RegistrationStatus, { label: string; className: string }> = {
  email_pending: {
    label: "Email Pending",
    className: "bg-[hsl(var(--status-pending-bg))] text-[hsl(var(--status-pending))]",
  },
  email_verified: {
    label: "Email Verified",
    className: "bg-[hsl(var(--status-invited-bg))] text-[hsl(var(--status-invited))]",
  },
  registration_complete: {
    label: "Registered",
    className: "bg-[hsl(var(--status-approved-bg))] text-[hsl(var(--status-approved))]",
  },
};

interface ApplicationStatusBadgeProps {
  type: "beta" | "registration";
  status: BetaStatus | RegistrationStatus;
  className?: string;
}

export default function ApplicationStatusBadge({
  type,
  status,
  className,
}: ApplicationStatusBadgeProps) {
  const config =
    type === "beta"
      ? betaStatusConfig[status as BetaStatus]
      : regStatusConfig[status as RegistrationStatus];

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
