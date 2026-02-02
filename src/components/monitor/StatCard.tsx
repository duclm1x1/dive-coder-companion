import { cn } from "@/lib/utils";
import { TrendingUp, LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    positive: boolean;
  };
  color?: 'primary' | 'success' | 'warning' | 'accent';
}

export function StatCard({ title, value, subtitle, icon: Icon, trend, color = 'primary' }: StatCardProps) {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary border-primary/20',
    success: 'bg-success/10 text-success border-success/20',
    warning: 'bg-warning-background text-warning border-warning/20',
    accent: 'bg-accent/10 text-accent border-accent/20',
  };

  return (
    <div className="glass-card p-6 rounded-xl hover:scale-[1.02] transition-transform duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className={cn(
          'p-3 rounded-xl border',
          colorClasses[color]
        )}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <div className={cn(
            'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full',
            trend.positive ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
          )}>
            <TrendingUp className={cn('w-3 h-3', !trend.positive && 'rotate-180')} />
            {trend.value}
          </div>
        )}
      </div>
      <div>
        <p className="text-2xs text-muted-foreground uppercase tracking-wider mb-1">{title}</p>
        <p className="text-3xl font-bold text-foreground mb-1">{value}</p>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
