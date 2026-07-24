import { Search, Filter, X, ChevronDown } from "lucide-react";
import type { ApplicationFilters, BetaStatus, RegistrationStatus } from "../../types/application";

const betaStatusOptions: { value: BetaStatus | ""; label: string }[] = [
  { value: "", label: "All Statuses" },
  { value: "pending_review", label: "Pending Review" },
  { value: "approved", label: "Approved" },
  { value: "invited", label: "Invited" },
  { value: "active", label: "Active" },
  { value: "declined", label: "Declined" },
  { value: "suspended", label: "Suspended" },
  { value: "completed", label: "Completed" },
];

const regStatusOptions: { value: RegistrationStatus | ""; label: string }[] = [
  { value: "", label: "All Registration" },
  { value: "email_pending", label: "Email Pending" },
  { value: "email_verified", label: "Email Verified" },
  { value: "registration_complete", label: "Registered" },
];

const sortOptions = [
  { value: "created_at", label: "Date Applied" },
  { value: "updated_at", label: "Last Updated" },
  { value: "email", label: "Email" },
];

interface ApplicationFiltersProps {
  search: string;
  betaStatus: BetaStatus | "";
  registrationStatus: RegistrationStatus | "";
  sort: string;
  order: "asc" | "desc";
  onSearchChange: (v: string) => void;
  onBetaStatusChange: (v: BetaStatus | "") => void;
  onRegistrationStatusChange: (v: RegistrationStatus | "") => void;
  onSortChange: (v: string) => void;
  onOrderChange: (v: "asc" | "desc") => void;
  onReset: () => void;
  total: number;
}

export default function ApplicationFilters({
  search,
  betaStatus,
  registrationStatus,
  sort,
  order,
  onSearchChange,
  onBetaStatusChange,
  onRegistrationStatusChange,
  onSortChange,
  onOrderChange,
  onReset,
  total,
}: ApplicationFiltersProps) {
  const hasFilters = search || betaStatus || registrationStatus;

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))]" />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-[hsl(var(--border))] rounded-lg bg-[hsl(var(--card))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:ring-offset-0"
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Beta status */}
        <div className="relative">
          <select
            value={betaStatus}
            onChange={(e) => onBetaStatusChange(e.target.value as BetaStatus | "")}
            className="appearance-none pl-3 pr-8 py-2 text-sm border border-[hsl(var(--border))] rounded-lg bg-[hsl(var(--card))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] cursor-pointer"
          >
            {betaStatusOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))] pointer-events-none" />
        </div>

        {/* Registration status */}
        <div className="relative">
          <select
            value={registrationStatus}
            onChange={(e) => onRegistrationStatusChange(e.target.value as RegistrationStatus | "")}
            className="appearance-none pl-3 pr-8 py-2 text-sm border border-[hsl(var(--border))] rounded-lg bg-[hsl(var(--card))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] cursor-pointer"
          >
            {regStatusOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))] pointer-events-none" />
        </div>

        {/* Sort */}
        <div className="relative">
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 text-sm border border-[hsl(var(--border))] rounded-lg bg-[hsl(var(--card))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] cursor-pointer"
          >
            {sortOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))] pointer-events-none" />
        </div>

        {/* Order toggle */}
        <button
          onClick={() => onOrderChange(order === "asc" ? "desc" : "asc")}
          className="px-3 py-2 text-sm border border-[hsl(var(--border))] rounded-lg bg-[hsl(var(--card))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors"
          title="Toggle sort order"
        >
          {order === "asc" ? "↑ Asc" : "↓ Desc"}
        </button>

        {/* Reset */}
        {hasFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-2 text-sm border border-[hsl(var(--border))] rounded-lg bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors"
          >
            <Filter className="w-3.5 h-3.5" />
            Reset
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
        <span>{total.toLocaleString()} application{total !== 1 ? "s" : ""}</span>
        {hasFilters && (
          <span className="px-1.5 py-0.5 bg-[hsl(var(--status-invited-bg))] text-[hsl(var(--status-invited))] rounded font-medium">
            Filtered
          </span>
        )}
      </div>
    </div>
  );
}
