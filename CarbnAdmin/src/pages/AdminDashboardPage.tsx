import { Link } from "react-router-dom";
import {
  Users,
  CheckCircle,
  Mail,
  Activity,
  Clock,
  XCircle,
  TrendingUp,
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

  return (
    <AdminLayout>
      <div className="px-4 lg:px-8 py-6 space-y-8 max-w-7xl mx-auto">
        {/* Header */}
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

        {/* Error */}
        {error && (
          <div className="p-4 bg-[hsl(var(--status-declined-bg))] border border-[hsl(var(--status-declined))]/20 rounded-lg text-sm text-[hsl(var(--status-declined))]">
            {error}
          </div>
        )}

        {/* Top metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Total Applications"
            value={metrics?.total_applications ?? 0}
            icon={Users}
            iconColor="text-[hsl(var(--status-invited))]"
            iconBg="bg-[hsl(var(--status-invited-bg))]"
            loading={isLoading}
          />
          <MetricCard
            label="Pending Review"
            value={metrics?.beta.pending_review ?? 0}
            icon={Clock}
            iconColor="text-[hsl(var(--status-pending))]"
            iconBg="bg-[hsl(var(--status-pending-bg))]"
            loading={isLoading}
          />
          <MetricCard
            label="Active Members"
            value={metrics?.active_beta_members ?? 0}
            icon={Activity}
            iconColor="text-[hsl(var(--status-active))]"
            iconBg="bg-[hsl(var(--status-active-bg))]"
            loading={isLoading}
          />
          <MetricCard
            label="Invitations Sent"
            value={metrics?.invitations_sent ?? 0}
            icon={Mail}
            iconColor="text-[hsl(var(--status-completed))]"
            iconBg="bg-[hsl(var(--status-completed-bg))]"
            loading={isLoading}
          />
        </div>

        {/* Rate metrics */}
        <div className="grid grid-cols-2 gap-4">
          <MetricCard
            label="Approval Rate"
            value={metrics ? `${metrics.approval_rate.toFixed(1)}` : "0"}
            suffix="%"
            icon={CheckCircle}
            iconColor="text-[hsl(var(--primary))]"
            iconBg="bg-[hsl(var(--status-approved-bg))]"
            loading={isLoading}
            description="Approved / Total applications"
          />
          <MetricCard
            label="Activation Rate"
            value={metrics ? `${metrics.activation_rate.toFixed(1)}` : "0"}
            suffix="%"
            icon={TrendingUp}
            iconColor="text-[hsl(var(--status-invited))]"
            iconBg="bg-[hsl(var(--status-invited-bg))]"
            loading={isLoading}
            description="Active / Invited users"
          />
        </div>

        {/* Detail breakdowns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Beta status breakdown */}
          <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-6">
            <h3 className="text-sm font-semibold text-[hsl(var(--foreground))] mb-4">Beta Status Breakdown</h3>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex justify-between py-2">
                    <div className="h-4 w-28 bg-[hsl(var(--muted))] rounded animate-pulse" />
                    <div className="h-4 w-8 bg-[hsl(var(--muted))] rounded animate-pulse" />
                  </div>
                ))}
              </div>
            ) : metrics ? (
              <>
                <StatRow label="Pending Review" value={metrics.beta.pending_review} color="bg-[hsl(var(--status-pending))]" />
                <StatRow label="Approved" value={metrics.beta.approved} color="bg-[hsl(var(--status-approved))]" />
                <StatRow label="Invited" value={metrics.beta.invited} color="bg-[hsl(var(--status-invited))]" />
                <StatRow label="Active" value={metrics.beta.active} color="bg-[hsl(var(--status-active))]" />
                <StatRow label="Declined" value={metrics.beta.declined} color="bg-[hsl(var(--status-declined))]" />
                <StatRow label="Suspended" value={metrics.beta.suspended} color="bg-[hsl(var(--status-suspended))]" />
                <StatRow label="Completed" value={metrics.beta.completed} color="bg-[hsl(var(--status-completed))]" />
              </>
            ) : null}
          </div>

          {/* Registration breakdown */}
          <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-6">
            <h3 className="text-sm font-semibold text-[hsl(var(--foreground))] mb-4">Registration Funnel</h3>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex justify-between py-2">
                    <div className="h-4 w-28 bg-[hsl(var(--muted))] rounded animate-pulse" />
                    <div className="h-4 w-8 bg-[hsl(var(--muted))] rounded animate-pulse" />
                  </div>
                ))}
              </div>
            ) : metrics ? (
              <div className="space-y-0">
                <StatRow label="Email Pending" value={metrics.registration.email_pending} color="bg-[hsl(var(--status-pending))]" />
                <StatRow label="Email Verified" value={metrics.registration.email_verified} color="bg-[hsl(var(--status-invited))]" />
                <StatRow label="Registration Complete" value={metrics.registration.registration_complete} color="bg-[hsl(var(--status-approved))]" />

                {/* Visual funnel */}
                {metrics.total_applications > 0 && (
                  <div className="mt-6 space-y-2">
                    <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Conversion</p>
                    {[
                      { label: "Email Verified", value: metrics.registration.email_verified, color: "bg-[hsl(var(--status-invited))]" },
                      { label: "Registered", value: metrics.registration.registration_complete, color: "bg-[hsl(var(--status-approved))]" },
                    ].map(({ label, value, color }) => {
                      const pct = metrics.total_applications > 0 ? (value / metrics.total_applications) * 100 : 0;
                      return (
                        <div key={label}>
                          <div className="flex justify-between text-xs text-[hsl(var(--muted-foreground))] mb-1">
                            <span>{label}</span>
                            <span>{pct.toFixed(1)}%</span>
                          </div>
                          <div className="h-1.5 bg-[hsl(var(--muted))] rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${color} transition-all duration-700`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Pending Review", href: "/admin/applications?status=pending_review", count: metrics?.beta.pending_review },
            { label: "Awaiting Invite", href: "/admin/applications?status=approved", count: metrics?.beta.approved },
            { label: "Declined", href: "/admin/applications?status=declined", count: metrics?.beta.declined },
            { label: "All Applications", href: "/admin/applications", count: metrics?.total_applications },
          ].map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className="flex flex-col gap-2 p-4 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl hover:border-[hsl(var(--ring))] hover:shadow-sm transition-all group"
            >
              <span className="text-xs text-[hsl(var(--muted-foreground))] font-medium">{item.label}</span>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-[hsl(var(--foreground))] tabular-nums">
                  {isLoading ? "—" : (item.count ?? 0).toLocaleString()}
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
