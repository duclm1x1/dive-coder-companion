import { Zap, CheckCircle, DollarSign, Sparkles, Clock, TrendingUp, Brain, Cpu, Shield, Command, Database, MessageSquare, Wifi, AlertCircle, Server } from "lucide-react";
import { DIVE_CODER_VERSION, DIVE_CODER_EDITION, DIVE_STATS, DIVE_FEATURES } from "@/lib/dive-coder-config";
import { cn } from "@/lib/utils";
import { useActivityLog, ActivityEvent } from "@/hooks/useActivityLog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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

export function DashboardView({ isConnected, stats }: DashboardViewProps) {
  const { events, clearEvents, getRecentEvents } = useActivityLog();
  const recentEvents = getRecentEvents(8);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return "just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
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
            {isConnected ? "Dive Coder is running" : "Waiting for Dive Coder"}
          </p>
          <p className="text-sm text-muted-foreground">
            {isConnected ? "Live monitoring data is being collected" : "Start Dive Coder to see live monitoring data"}
          </p>
        </div>
        {isConnected && (
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs text-success font-medium">LIVE</span>
          </div>
        )}
      </div>

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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Total Runs */}
        <div className="p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors">
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
              <Zap className="w-6 h-6 text-foreground" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">TOTAL RUNS</p>
            <p className="text-4xl font-bold text-foreground mt-1">{stats.totalRuns}</p>
            <p className="text-sm text-muted-foreground mt-1">All time</p>
          </div>
        </div>

        {/* Success Rate */}
        <div className="p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors">
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-primary" />
            </div>
            <div className="flex items-center gap-1 text-success text-sm font-medium">
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
        <div className="p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors">
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-success" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">TOTAL COST</p>
            <p className="text-4xl font-bold text-foreground mt-1">${stats.totalCost.toFixed(4)}</p>
            <p className="text-sm text-muted-foreground mt-1">{stats.apiCalls} API calls</p>
          </div>
        </div>

        {/* Active Provider */}
        <div className="p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors">
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-secondary" />
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
