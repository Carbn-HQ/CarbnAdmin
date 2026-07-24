import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "../../lib/utils";

interface MetricCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  trend?: number;
  suffix?: string;
  description?: string;
  loading?: boolean;
}

export default function MetricCard({
  label,
  value,
  icon: Icon,
  iconColor = "text-[hsl(var(--primary))]",
  iconBg = "bg-[hsl(var(--status-approved-bg))]",
  trend,
  suffix,
  description,
  loading = false,
}: MetricCardProps) {
  const TrendIcon = trend === undefined || trend === 0 ? Minus : trend > 0 ? TrendingUp : TrendingDown;
  const trendColor =
    trend === undefined || trend === 0
      ? "text-[hsl(var(--muted-foreground))]"
      : trend > 0
      ? "text-[hsl(var(--status-active))]"
      : "text-[hsl(var(--destructive))]";

  return (
    <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-5 flex flex-col gap-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between">
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", iconBg)}>
          <Icon className={cn("w-5 h-5", iconColor)} />
        </div>
        {trend !== undefined && (
          <span className={cn("flex items-center gap-1 text-xs font-medium", trendColor)}>
            <TrendIcon className="w-3 h-3" />
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      {loading ? (
        <div className="space-y-2">
          <div className="h-7 w-20 bg-[hsl(var(--muted))] rounded animate-pulse" />
          <div className="h-3 w-28 bg-[hsl(var(--muted))] rounded animate-pulse" />
        </div>
      ) : (
        <div>
          <p className="text-2xl font-bold text-[hsl(var(--foreground))] tabular-nums">
            {typeof value === "number" ? value.toLocaleString() : value}
            {suffix && <span className="text-base font-medium text-[hsl(var(--muted-foreground))] ml-1">{suffix}</span>}
          </p>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-0.5">{label}</p>
          {description && (
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1 opacity-75">{description}</p>
          )}
        </div>
      )}
    </div>
  );
}
