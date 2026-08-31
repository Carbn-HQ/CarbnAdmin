import { Search, Filter, X, ChevronDown } from "lucide-react";
import type { ApplicantStatus } from "../../types/application";

const statusOptions: { value: ApplicantStatus | ""; label: string }[] = [
  { value: "", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "active", label: "Active" },
  { value: "declined", label: "Declined" },
];

interface ApplicationFiltersProps {
  search: string;
  status: ApplicantStatus | "";
  onSearchChange: (v: string) => void;
  onStatusChange: (v: ApplicantStatus | "") => void;
  onReset: () => void;
  total: number;
}

export default function ApplicationFilters({
  search,
  status,
  onSearchChange,
  onStatusChange,
  onReset,
  total,
}: ApplicationFiltersProps) {
  const hasFilters = Boolean(search || status);

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
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

        <div className="relative">
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value as ApplicantStatus | "")}
            className="appearance-none pl-3 pr-8 py-2 text-sm border border-[hsl(var(--border))] rounded-lg bg-[hsl(var(--card))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] cursor-pointer"
          >
            {statusOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))] pointer-events-none" />
        </div>

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
