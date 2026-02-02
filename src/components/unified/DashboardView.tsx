import { Zap, CheckCircle, DollarSign, Sparkles, Clock, TrendingUp } from "lucide-react";

interface StatCardProps {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string;
  subtext: string;
  trend?: string;
}

function StatCard({ icon, iconBg, label, value, subtext, trend }: StatCardProps) {
  return (
    <div className="p-6 rounded-xl bg-card border border-border">
      <div className="flex items-start justify-between">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-success text-sm font-medium">
            <TrendingUp className="w-3 h-3" />
            {trend}
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">{label}</p>
        <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
        <p className="text-sm text-muted-foreground mt-1">{subtext}</p>
      </div>
    </div>
  );
}

interface DashboardViewProps {
  isConnected: boolean;
  stats: {
    totalRuns: number;
    successRate: number;
    completedRuns: number;
    totalCost: number;
    apiCalls: number;
    activeProvider: string;
  };
}

export function DashboardView({ isConnected, stats }: DashboardViewProps) {
  return (
    <div className="p-6 space-y-6 overflow-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dive Monitor Dashboard</h1>
        <p className="text-muted-foreground mt-1">Real-time monitoring and analytics for your AI coding assistant</p>
      </div>

      {/* Status Banner */}
      <div className={`p-4 rounded-xl flex items-center gap-3 ${
        isConnected 
          ? "bg-success/10 border border-success/20" 
          : "bg-warning/10 border border-warning/20"
      }`}>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
          isConnected ? "bg-success/20" : "bg-warning/20"
        }`}>
          <Sparkles className={`w-5 h-5 ${isConnected ? "text-success" : "text-warning"}`} />
        </div>
        <div>
          <p className={`font-medium ${isConnected ? "text-success" : "text-warning"}`}>
            {isConnected ? "DiveCoder is running" : "Waiting for DiveCoder"}
          </p>
          <p className="text-sm text-muted-foreground">
            {isConnected ? "Live monitoring data is being collected" : "Start DiveCoder to see live monitoring data"}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard
          icon={<Zap className="w-6 h-6 text-foreground" />}
          iconBg="bg-muted"
          label="Total Runs"
          value={stats.totalRuns.toString()}
          subtext="All time"
          trend="+12%"
        />
        <StatCard
          icon={<CheckCircle className="w-6 h-6 text-success" />}
          iconBg="bg-success/10"
          label="Success Rate"
          value={`${stats.successRate}%`}
          subtext={`${stats.completedRuns} completed`}
        />
        <StatCard
          icon={<DollarSign className="w-6 h-6 text-warning" />}
          iconBg="bg-warning/10"
          label="Total Cost"
          value={`$${stats.totalCost.toFixed(4)}`}
          subtext={`${stats.apiCalls} API calls`}
        />
        <StatCard
          icon={<Sparkles className="w-6 h-6 text-primary" />}
          iconBg="bg-primary/10"
          label="Active Provider"
          value={stats.activeProvider || "None"}
          subtext={isConnected ? "Running" : "Waiting..."}
        />
      </div>

      {/* Recent Activity */}
      <div className="rounded-xl bg-card border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
          <Clock className="w-5 h-5 text-muted-foreground" />
        </div>
        <div className="text-center py-8 text-muted-foreground">
          No recent activity
        </div>
      </div>
    </div>
  );
}
