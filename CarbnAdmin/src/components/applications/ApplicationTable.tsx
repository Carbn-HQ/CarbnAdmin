import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import ApplicationStatusBadge from "./ApplicationStatusBadge";
import { formatDate } from "../../utils/formatDate";
import type { BetaApplication } from "../../types/application";

interface ApplicationTableProps {
  applications: BetaApplication[];
  isLoading: boolean;
  error: string | null;
}

const columns = [
  { key: "email", label: "Applicant" },
  { key: "status", label: "Status" },
  { key: "form", label: "Application" },
  { key: "created_at", label: "Applied" },
];

function SkeletonRow() {
  return (
    <tr>
      {columns.map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-[hsl(var(--muted))] rounded animate-pulse" style={{ width: `${60 + (i * 15) % 30}%` }} />
        </td>
      ))}
      <td className="px-4 py-3"><div className="h-4 w-4 bg-[hsl(var(--muted))] rounded animate-pulse ml-auto" /></td>
    </tr>
  );
}

export default function ApplicationTable({
  applications,
  isLoading,
  error,
}: ApplicationTableProps) {
  const navigate = useNavigate();

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-12 h-12 rounded-full bg-[hsl(var(--status-declined-bg))] flex items-center justify-center mb-3">
          <span className="text-[hsl(var(--status-declined))] text-xl">!</span>
        </div>
        <p className="text-sm font-medium text-[hsl(var(--foreground))]">Failed to load applications</p>
        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[hsl(var(--border))]">
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 text-left text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider whitespace-nowrap"
              >
                {col.label}
              </th>
            ))}
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-[hsl(var(--border))]">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
            : applications.length === 0
            ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-4 py-16 text-center">
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">No applications found.</p>
                </td>
              </tr>
            )
            : applications.map((app) => (
              <tr
                key={app.id}
                onClick={() => navigate(`/admin/applications/${app.id}`)}
                className="hover:bg-[hsl(var(--muted))] cursor-pointer transition-colors group"
              >
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <span className="font-medium text-[hsl(var(--foreground))]">
                      {app.first_name || app.last_name
                        ? `${app.first_name ?? ""} ${app.last_name ?? ""}`.trim()
                        : <span className="text-[hsl(var(--muted-foreground))]">–</span>
                      }
                    </span>
                    <span className="text-xs text-[hsl(var(--muted-foreground))]">{app.email}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <ApplicationStatusBadge status={app.status} />
                </td>
                <td className="px-4 py-3 text-[hsl(var(--muted-foreground))] whitespace-nowrap text-xs">
                  {app.application_submitted_at ? "Form submitted" : "Email only"}
                </td>
                <td className="px-4 py-3 text-[hsl(var(--muted-foreground))] whitespace-nowrap text-xs">
                  {formatDate(app.created_at)}
                </td>
                <td className="px-4 py-3">
                  <ChevronRight className="w-4 h-4 text-[hsl(var(--muted-foreground))] ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </td>
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
  );
}
