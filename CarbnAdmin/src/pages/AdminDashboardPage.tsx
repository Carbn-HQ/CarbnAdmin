import { Link } from "react-router-dom";
import {
  Users,
  CheckCircle,
  Activity,
  Clock,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import AdminLayout from "../components/layout/AdminLayout";
import MetricCard from "../components/dashboard/MetricCard";
import { useBetaMetrics } from "../hooks/useBetaMetrics";
import { useAdminAuth } from "../hooks/useAdminAuth";

function StatRow({ label, value, color = "bg-[hsl(var(--muted))]" }: { label: string; value: number; color?: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[hsl(var(--border))] last:border-0">
      <span className="text-sm text-[hsl(var(--muted-foreground))]">{label}</span>
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${color}`} />
        <span className="text-sm font-semibold text-[hsl(var(--foreground))] tabular-nums">{value.toLocaleString()}</span>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { admin } = useAdminAuth();
  const { metrics, isLoading, error, refetch } = useBetaMetrics();

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const total = metrics?.total_applicants ?? 0;
  const pending = metrics?.pending ?? 0;
  const approved = metrics?.approved ?? 0;
  const active = metrics?.active ?? 0;
  const declined = metrics?.declined ?? 0;
  const approvalRate = total > 0 ? ((approved + active) / total) * 100 : 0;

  return (
    <AdminLayout>
      <div className="px-4 lg:px-8 py-6 space-y-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">
              {greeting()}, {admin?.first_name ?? "Admin"}.
            </h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-0.5">
              Here's an overview of your founding beta program.
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
            <Link
              to="/admin/applications"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg hover:opacity-90 transition-opacity"
            >
              View Applications
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-[hsl(var(--status-declined-bg))] border border-[hsl(var(--status-declined))]/20 rounded-lg text-sm text-[hsl(var(--status-declined))]">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Total Applicants"
            value={total}
            icon={Users}
            iconColor="text-[hsl(var(--status-invited))]"
            iconBg="bg-[hsl(var(--status-invited-bg))]"
            loading={isLoading}
          />
          <MetricCard
            label="Pending Approval"
            value={pending}
            icon={Clock}
            iconColor="text-[hsl(var(--status-pending))]"
            iconBg="bg-[hsl(var(--status-pending-bg))]"
            loading={isLoading}
          />
          <MetricCard
            label="Approved"
            value={approved}
            icon={CheckCircle}
            iconColor="text-[hsl(var(--status-approved))]"
            iconBg="bg-[hsl(var(--status-approved-bg))]"
            loading={isLoading}
          />
          <MetricCard
            label="Active Members"
            value={active}
            icon={Activity}
            iconColor="text-[hsl(var(--status-active))]"
            iconBg="bg-[hsl(var(--status-active-bg))]"
            loading={isLoading}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-6">
            <h3 className="text-sm font-semibold text-[hsl(var(--foreground))] mb-4">Status breakdown</h3>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex justify-between py-2">
                    <div className="h-4 w-28 bg-[hsl(var(--muted))] rounded animate-pulse" />
                    <div className="h-4 w-8 bg-[hsl(var(--muted))] rounded animate-pulse" />
                  </div>
                ))}
              </div>
            ) : (
              <>
                <StatRow label="Pending" value={pending} color="bg-[hsl(var(--status-pending))]" />
                <StatRow label="Approved" value={approved} color="bg-[hsl(var(--status-approved))]" />
                <StatRow label="Active" value={active} color="bg-[hsl(var(--status-active))]" />
                <StatRow label="Declined" value={declined} color="bg-[hsl(var(--status-declined))]" />
              </>
            )}
          </div>

          <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-6">
            <h3 className="text-sm font-semibold text-[hsl(var(--foreground))] mb-4">Approval rate</h3>
            <p className="text-4xl font-bold text-[hsl(var(--foreground))]">
              {approvalRate.toFixed(1)}%
            </p>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-2">
              Approved or active applicants out of all applications.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Pending", href: "/admin/applications?status=pending", count: pending },
            { label: "Approved", href: "/admin/applications?status=approved", count: approved },
            { label: "Declined", href: "/admin/applications?status=declined", count: declined },
            { label: "All Applications", href: "/admin/applications", count: total },
          ].map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className="flex flex-col gap-2 p-4 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl hover:border-[hsl(var(--ring))] hover:shadow-sm transition-all group"
            >
              <span className="text-xs text-[hsl(var(--muted-foreground))] font-medium">{item.label}</span>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-[hsl(var(--foreground))] tabular-nums">
                  {isLoading ? "—" : item.count.toLocaleString()}
                </span>
                <ArrowRight className="w-4 h-4 text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--primary))] transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
