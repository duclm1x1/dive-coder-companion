import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, LucideIcon } from "lucide-react";
import { MiniSparkline } from "./MiniSparkline";
import { MetricDataPoint } from "@/hooks/useMetricsHistory";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  history?: MetricDataPoint[];
  trend?: {
    value: string;
    positive: boolean;
  };
  color?: "primary" | "success" | "warning" | "secondary";
  formatValue?: (v: number) => string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  history,
  trend,
  color = "primary",
}: MetricCardProps) {
  const colorClasses = {
    primary: {
      icon: "bg-primary/10 text-primary",
      sparkline: "hsl(var(--primary))",
    },
    success: {
      icon: "bg-success/10 text-success",
      sparkline: "hsl(var(--success))",
    },
    warning: {
      icon: "bg-warning-background text-warning",
      sparkline: "hsl(var(--warning))",
    },
    secondary: {
      icon: "bg-secondary/10 text-secondary",
      sparkline: "hsl(var(--secondary))",
    },
  };

  const colors = colorClasses[color];

  // Calculate trend from history if not provided
  const calculatedTrend = trend || (() => {
    if (!history || history.length < 2) return undefined;
    
    const recent = history.slice(-5);
    const older = history.slice(-10, -5);
    
    if (older.length === 0) return undefined;
    
    const recentAvg = recent.reduce((s, p) => s + p.value, 0) / recent.length;
    const olderAvg = older.reduce((s, p) => s + p.value, 0) / older.length;
    
    if (olderAvg === 0) return undefined;
    
    const change = ((recentAvg - olderAvg) / olderAvg) * 100;
    
    return {
      value: `${change > 0 ? "+" : ""}${change.toFixed(0)}%`,
      positive: change >= 0,
    };
  })();

  return (
    <div className="p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors group">
      <div className="flex items-start justify-between mb-4">
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", colors.icon)}>
          <Icon className="w-6 h-6" />
        </div>
        
        {calculatedTrend && (
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
              calculatedTrend.positive
                ? "bg-success/10 text-success"
                : "bg-destructive/10 text-destructive"
            )}
          >
            {calculatedTrend.positive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {calculatedTrend.value}
          </div>
        )}
      </div>

      <div className="flex items-end justify-between">
        <div className="flex-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
            {title}
          </p>
          <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>

        {history && history.length >= 2 && (
          <div className="opacity-60 group-hover:opacity-100 transition-opacity">
            <MiniSparkline
              data={history}
              width={80}
              height={32}
              color={colors.sparkline}
            />
          </div>
        )}
      </div>
    </div>
  );
}
