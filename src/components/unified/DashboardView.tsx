import { Zap, CheckCircle, DollarSign, Sparkles, Clock, TrendingUp } from "lucide-react";

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
    <div className="p-6 max-w-5xl mx-auto space-y-6 overflow-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dive Monitor Dashboard</h1>
        <p className="text-muted-foreground mt-1">Real-time monitoring and analytics for your AI coding assistant</p>
      </div>

      {/* Status Banner */}
      <div className={`p-4 rounded-xl flex items-center gap-3 ${
        isConnected 
          ? "bg-emerald-50 border border-emerald-200" 
          : "bg-amber-50 border border-amber-200"
      }`}>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
          isConnected ? "bg-emerald-100" : "bg-amber-100"
        }`}>
          <Sparkles className={`w-5 h-5 ${isConnected ? "text-emerald-600" : "text-amber-600"}`} />
        </div>
        <div>
          <p className={`font-medium ${isConnected ? "text-emerald-800" : "text-amber-800"}`}>
            {isConnected ? "DiveCoder is running" : "Waiting for DiveCoder"}
          </p>
          <p className={`text-sm ${isConnected ? "text-emerald-600" : "text-amber-600"}`}>
            {isConnected ? "Live monitoring data is being collected" : "Start DiveCoder to see live monitoring data"}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Total Runs */}
        <div className="p-6 rounded-xl bg-card border border-border">
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
              <Zap className="w-6 h-6 text-slate-700" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">TOTAL RUNS</p>
            <p className="text-4xl font-bold text-foreground mt-1">{stats.totalRuns}</p>
            <p className="text-sm text-muted-foreground mt-1">All time</p>
          </div>
        </div>

        {/* Success Rate */}
        <div className="p-6 rounded-xl bg-card border border-border">
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-xl bg-cyan-50 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-cyan-500" />
            </div>
            <div className="flex items-center gap-1 text-emerald-500 text-sm font-medium">
              <TrendingUp className="w-4 h-4" />
              +12%
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">SUCCESS RATE</p>
            <p className="text-4xl font-bold text-foreground mt-1">{stats.successRate}%</p>
            <p className="text-sm text-muted-foreground mt-1">{stats.completedRuns} completed</p>
          </div>
        </div>

        {/* Total Cost */}
        <div className="p-6 rounded-xl bg-card border border-border">
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-amber-500" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">TOTAL COST</p>
            <p className="text-4xl font-bold text-foreground mt-1">${stats.totalCost.toFixed(4)}</p>
            <p className="text-sm text-muted-foreground mt-1">{stats.apiCalls} API calls</p>
          </div>
        </div>

        {/* Active Provider */}
        <div className="p-6 rounded-xl bg-card border border-border">
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-xl bg-cyan-50 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-cyan-500" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">ACTIVE PROVIDER</p>
            <p className="text-4xl font-bold text-foreground mt-1">{stats.activeProvider || "None"}</p>
            <p className="text-sm text-muted-foreground mt-1">{isConnected ? "Running" : "Waiting..."}</p>
          </div>
        </div>
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
