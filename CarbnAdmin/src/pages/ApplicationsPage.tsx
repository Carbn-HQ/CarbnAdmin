import { useState, useMemo, useCallback } from "react";
import { UserPlus, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import AdminLayout from "../components/layout/AdminLayout";
import ApplicationTable from "../components/applications/ApplicationTable";
import ApplicationFiltersComponent from "../components/applications/ApplicationFilters";
import ManualApplicationModal from "../components/applications/ManualApplicationModal";
import { useBetaApplications } from "../hooks/useBetaApplications";
import type { BetaStatus, RegistrationStatus } from "../types/application";

export default function ApplicationsPage() {
  const [search, setSearch] = useState("");
  const [betaStatus, setBetaStatus] = useState<BetaStatus | "">("");
  const [registrationStatus, setRegistrationStatus] = useState<RegistrationStatus | "">("");
  const [sort, setSort] = useState("created_at");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [showManualModal, setShowManualModal] = useState(false);

  const filters = useMemo(
    () => ({
      search: search || undefined,
      beta_status: betaStatus || undefined,
      registration_status: registrationStatus || undefined,
      sort,
      order,
    }),
    [search, betaStatus, registrationStatus, sort, order]
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
    setBetaStatus("");
    setRegistrationStatus("");
    setSort("created_at");
    setOrder("desc");
  }, []);

  return (
    <AdminLayout>
      <div className="px-4 lg:px-8 py-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">Applications</h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-0.5">
              Review and manage founding beta applicants.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => void refetch()}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-2 text-sm border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button
              onClick={() => setShowManualModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg hover:opacity-90 transition-opacity"
            >
              <UserPlus className="w-4 h-4" />
              Add Manually
            </button>
          </div>
        </div>

        {/* Filters */}
        <ApplicationFiltersComponent
          search={search}
          betaStatus={betaStatus}
          registrationStatus={registrationStatus}
          sort={sort}
          order={order}
          onSearchChange={setSearch}
          onBetaStatusChange={setBetaStatus}
          onRegistrationStatusChange={setRegistrationStatus}
          onSortChange={setSort}
          onOrderChange={setOrder}
          onReset={handleReset}
          total={total}
        />

        {/* Table */}
        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl overflow-hidden">
          <ApplicationTable
            applications={applications}
            isLoading={isLoading}
            error={error}
          />

          {/* Pagination */}
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

                {/* Page numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum = i + 1;
                    if (totalPages > 5) {
                      if (page <= 3) pageNum = i + 1;
                      else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                      else pageNum = page - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        disabled={isLoading}
                        className={`w-7 h-7 text-xs rounded-lg transition-colors disabled:opacity-50 ${
                          pageNum === page
                            ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                            : "border border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

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

      {showManualModal && (
        <ManualApplicationModal
          onClose={() => setShowManualModal(false)}
          onSuccess={() => void refetch()}
        />
      )}
    </AdminLayout>
  );
}
