import { useEffect } from "react";
import { Zap, CheckCircle, DollarSign, Sparkles, Clock, Brain, Cpu, Shield, Command, Database, MessageSquare, AlertCircle, Server, Gauge, Activity, BarChart3, Trash2, RefreshCw, Users } from "lucide-react";
import { DIVE_CODER_VERSION, DIVE_CODER_EDITION, DIVE_STATS, DIVE_FEATURES } from "@/lib/dive-coder-config";
import { cn } from "@/lib/utils";
import { useActivityLog, ActivityEvent } from "@/hooks/useActivityLog";
import { useMetricsHistory, AggregatedMetrics } from "@/hooks/useMetricsHistory";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { useDiveBackend } from "@/hooks/useDiveBackend";

interface DashboardViewProps {
  isConnected?: boolean;
  stats?: {
    totalRuns: number;
    successRate: number;
    completedRuns: number;
    totalCost: number;
    apiCalls: number;
    activeProvider: string;
  };
}

const featureIcons: Record<string, React.ReactNode> = {
  Database: <Database className="w-5 h-5" />,
  Cpu: <Cpu className="w-5 h-5" />,
  Shield: <Shield className="w-5 h-5" />,
  Brain: <Brain className="w-5 h-5" />,
  Command: <Command className="w-5 h-5" />,
  Sparkles: <Sparkles className="w-5 h-5" />,
};

const eventIcons: Record<ActivityEvent["type"], React.ReactNode> = {
  chat: <MessageSquare className="w-4 h-4" />,
  api_call: <Zap className="w-4 h-4" />,
  model_test: <Clock className="w-4 h-4" />,
  error: <AlertCircle className="w-4 h-4" />,
  system: <Cpu className="w-4 h-4" />,
  provider: <Server className="w-4 h-4" />,
};

const eventColors: Record<ActivityEvent["type"], string> = {
  chat: "text-blue-500 bg-blue-500/10",
  api_call: "text-emerald-500 bg-emerald-500/10",
  model_test: "text-amber-500 bg-amber-500/10",
  error: "text-destructive bg-destructive/10",
  system: "text-purple-500 bg-purple-500/10",
  provider: "text-cyan-500 bg-cyan-500/10",
};

export function DashboardView({ isConnected: propIsConnected, stats: propStats }: DashboardViewProps) {
  const { events, clearEvents, getRecentEvents } = useActivityLog();
  const { getAggregatedMetrics, clearMetrics, snapshots } = useMetricsHistory();
  const recentEvents = getRecentEvents(8);
  
  // Use Dive Backend hook for real-time data
  const { 
    isConnected: backendConnected, 
    status, 
    stats: backendStats, 
    agents,
    isLoading,
    error,
    refresh,
    connect,
    disconnect
  } = useDiveBackend();

  // Use backend connection status if available, fallback to props
  const isConnected = backendConnected || propIsConnected || false;
  
  // Merge backend stats with props and local metrics
  const stats = {
    totalRuns: backendStats?.totalRuns ?? propStats?.totalRuns ?? 0,
    successRate: backendStats?.successRate ?? propStats?.successRate ?? 0,
    completedRuns: propStats?.completedRuns ?? 0,
    totalCost: backendStats?.totalCost ?? propStats?.totalCost ?? 0,
    apiCalls: propStats?.apiCalls ?? 0,
    activeProvider: backendStats?.activeProvider ?? propStats?.activeProvider ?? "None",
  };

  // Count active agents
  const activeAgents = agents.filter(a => a.status === 'busy').length;
  const totalAgents = agents.length || 128;
  
  // Get aggregated metrics with history
  const metrics: AggregatedMetrics = getAggregatedMetrics();

  // Initialize connection on mount
  useEffect(() => {
    connect('user-lovable', 'Lovable User');
    return () => disconnect();
  }, [connect, disconnect]);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return "just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  const handleClearAll = () => {
    clearEvents();
    clearMetrics();
  };

  const handleRefresh = () => {
    refresh();
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 overflow-auto">
      {/* Header with Branding */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-glow">
              <Brain className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text">Dive Monitor</h1>
              <p className="text-sm text-muted-foreground">{DIVE_CODER_VERSION} {DIVE_CODER_EDITION}</p>
            </div>
          </div>
          <p className="text-muted-foreground mt-2">Real-time monitoring and analytics for your AI coding assistant</p>
        </div>
        
        {/* Quick Stats */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">{DIVE_STATS.skills}+</p>
            <p className="text-xs text-muted-foreground">Skills</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-foreground">{DIVE_STATS.totalFiles}</p>
            <p className="text-xs text-muted-foreground">Files</p>
          </div>
        </div>
      </div>

      {/* Status Banner */}
      <div className={cn(
        "p-4 rounded-xl flex items-center gap-3 transition-all",
        isConnected 
          ? "bg-success/10 border border-success/30" 
          : "bg-warning/10 border border-warning/30"
      )}>
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center",
          isConnected ? "bg-success/20" : "bg-warning/20"
        )}>
          <Sparkles className={cn("w-5 h-5", isConnected ? "text-success" : "text-warning")} />
        </div>
        <div className="flex-1">
          <p className={cn("font-medium", isConnected ? "text-success" : "text-warning")}>
            {isConnected ? "Dive AI V20 Connected" : "Waiting for Dive AI V20"}
          </p>
          <p className="text-sm text-muted-foreground">
            {isConnected 
              ? `${activeAgents}/${totalAgents} agents active • ${status?.models || 0} models available` 
              : error || "Start Dive AI backend to see live monitoring data"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isLoading}
            className="text-muted-foreground"
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
          </Button>
          {isConnected && (
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-xs text-success font-medium">LIVE</span>
            </div>
          )}
        </div>
      </div>

      {/* Agent Status Summary (when connected) */}
      {isConnected && agents.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-card border border-border">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Users className="w-4 h-4" />
              <span className="text-xs">Total Agents</span>
            </div>
            <p className="text-xl font-bold">{totalAgents}</p>
          </div>
          <div className="p-3 rounded-lg bg-card border border-success/20">
            <div className="flex items-center gap-2 text-success mb-1">
              <Zap className="w-4 h-4" />
              <span className="text-xs">Active</span>
            </div>
            <p className="text-xl font-bold text-success">{activeAgents}</p>
          </div>
          <div className="p-3 rounded-lg bg-card border border-border">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs">Idle</span>
            </div>
            <p className="text-xl font-bold">{agents.filter(a => a.status === 'idle').length}</p>
          </div>
          <div className="p-3 rounded-lg bg-card border border-destructive/20">
            <div className="flex items-center gap-2 text-destructive mb-1">
              <AlertCircle className="w-4 h-4" />
              <span className="text-xs">Errors</span>
            </div>
            <p className="text-xl font-bold text-destructive">{agents.filter(a => a.status === 'error').length}</p>
          </div>
        </div>
      )}

      {/* V19.5 Features Grid */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Core Features</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {DIVE_FEATURES.map((feature) => (
            <div
              key={feature.id}
              className={cn(
                "p-3 rounded-xl border transition-all",
                feature.enabled 
                  ? "bg-card border-primary/20 hover:border-primary/40" 
                  : "bg-muted/50 border-border opacity-50"
              )}
            >
              <div className={cn("mb-2", feature.color)}>
                {featureIcons[feature.icon]}
              </div>
              <p className="text-sm font-medium text-foreground">{feature.label}</p>
              <p className="text-[10px] text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Grid with History */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Performance Metrics</h2>
          {snapshots.length > 0 && (
            <Button variant="ghost" size="sm" onClick={handleClearAll} className="text-muted-foreground h-7">
              <Trash2 className="w-3 h-3 mr-1" />
              Clear All
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Total Runs */}
          <MetricCard
            title="TOTAL RUNS"
            value={metrics.totalRuns || stats.totalRuns}
            subtitle={`${metrics.successfulRuns} successful`}
            icon={Zap}
            history={metrics.runsHistory}
            color="primary"
          />

          {/* Success Rate */}
          <MetricCard
            title="SUCCESS RATE"
            value={`${metrics.successRate}%`}
            subtitle={`${metrics.successfulRuns} of ${metrics.totalRuns} runs`}
            icon={CheckCircle}
            history={metrics.runsHistory.map(p => ({ ...p, value: p.value > 0 ? 100 : 0 }))}
            color="success"
          />

          {/* Total Cost */}
          <MetricCard
            title="TOTAL COST"
            value={`$${(metrics.totalCost || stats.totalCost).toFixed(4)}`}
            subtitle={`${metrics.totalInputTokens + metrics.totalOutputTokens} tokens used`}
            icon={DollarSign}
            history={metrics.costHistory}
            color="success"
          />

          {/* Avg Latency */}
          <MetricCard
            title="AVG LATENCY"
            value={`${metrics.avgLatency}ms`}
            subtitle={`P50: ${metrics.p50Latency}ms • P95: ${metrics.p95Latency}ms`}
            icon={Gauge}
            history={metrics.latencyHistory}
            color="warning"
          />

          {/* Tokens Used */}
          <MetricCard
            title="TOKENS USED"
            value={metrics.totalInputTokens + metrics.totalOutputTokens}
            subtitle={`In: ${metrics.totalInputTokens} • Out: ${metrics.totalOutputTokens}`}
            icon={Activity}
            history={metrics.tokensHistory}
            color="secondary"
          />

          {/* Active Provider */}
          <MetricCard
            title="ACTIVE PROVIDER"
            value={stats.activeProvider || "None"}
            subtitle={isConnected ? "Running" : "Waiting..."}
            icon={BarChart3}
            color="primary"
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-xl bg-card border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
            {recentEvents.length > 0 && (
              <Badge variant="secondary" className="text-xs">{events.length}</Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {events.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearEvents} className="text-muted-foreground">
                Clear
              </Button>
            )}
            <Clock className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>
        
        {recentEvents.length > 0 ? (
          <div className="space-y-2">
            {recentEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                  eventColors[event.type]
                )}>
                  {eventIcons[event.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm text-foreground">{event.title}</p>
                    {event.status === "error" && (
                      <Badge variant="destructive" className="text-xs">Error</Badge>
                    )}
                  </div>
                  {event.description && (
                    <p className="text-xs text-muted-foreground truncate">{event.description}</p>
                  )}
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatTime(event.timestamp)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No recent activity</p>
            <p className="text-xs mt-1">Activity will appear here when you use Dive Coder</p>
          </div>
        )}
      </div>
    </div>
  );
}