import { useState, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import AdminLayout from "../components/layout/AdminLayout";
import ApplicationTable from "../components/applications/ApplicationTable";
import ApplicationFiltersComponent from "../components/applications/ApplicationFilters";
import { useBetaApplications } from "../hooks/useBetaApplications";
import type { ApplicantStatus } from "../types/application";

const isStatus = (value: string | null): value is ApplicantStatus =>
  value === "pending" || value === "approved" || value === "declined" || value === "active";

export default function ApplicationsPage() {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ApplicantStatus | "">(
    isStatus(searchParams.get("status")) ? searchParams.get("status") as ApplicantStatus : ""
  );

  const filters = useMemo(
    () => ({
      search: search || undefined,
      status: status || undefined,
    }),
    [search, status]
  );

  const {
    applications,
    page,
    totalPages,
    total,
    isLoading,
    error,
    setPage,
    refetch,
  } = useBetaApplications(filters);

  const handleReset = useCallback(() => {
    setSearch("");
    setStatus("");
  }, []);

  return (
    <AdminLayout>
      <div className="px-4 lg:px-8 py-6 space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">Applications</h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-0.5">
              Review and manage founding beta applicants.
            </p>
          </div>
          <button
            onClick={() => void refetch()}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-2 text-sm border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        <ApplicationFiltersComponent
          search={search}
          status={status}
          onSearchChange={setSearch}
          onStatusChange={setStatus}
          onReset={handleReset}
          total={total}
        />

        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl overflow-hidden">
          <ApplicationTable
            applications={applications}
            isLoading={isLoading}
            error={error}
          />

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-[hsl(var(--border))]">
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                Page {page} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1 || isLoading}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Prev
                </button>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= totalPages || isLoading}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
