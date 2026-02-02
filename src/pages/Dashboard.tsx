import { StatsCard } from "@/components/dashboard/StatsCard";
import { ActivityChart } from "@/components/dashboard/ActivityChart";
import { RecentTasks } from "@/components/dashboard/RecentTasks";
import { SystemMetrics } from "@/components/dashboard/SystemMetrics";
import { Zap, GitBranch, AlertTriangle, CheckCircle2, MessageSquare } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="p-6 space-y-6 bg-background-secondary min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Dive Coder Console</h1>
          <p className="text-sm text-muted-foreground mt-1">V19.5 • Dual Thinking Engine Active</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-success/10 border border-success/20">
          <Zap className="w-4 h-4 text-success" />
          <span className="text-sm text-success font-medium">Engine Online</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Tasks Completed"
          value={247}
          subtitle="Today"
          icon={CheckCircle2}
          variant="success"
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Active Branches"
          value={8}
          subtitle="3 pending review"
          icon={GitBranch}
          variant="primary"
        />
        <StatsCard
          title="AI Conversations"
          value={34}
          subtitle="This session"
          icon={MessageSquare}
          variant="accent"
          trend={{ value: 5, isPositive: true }}
        />
        <StatsCard
          title="Code Issues"
          value={3}
          subtitle="2 warnings, 1 error"
          icon={AlertTriangle}
          variant="warning"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ActivityChart title="Task Activity (24h)" />
        <ActivityChart title="AI Query Volume" />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <RecentTasks />
        </div>
        <SystemMetrics />
      </div>

      {/* Quick Actions */}
      <div className="p-5 rounded-xl bg-card border border-border">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">Quick Commands</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { cmd: "/vibe-status", desc: "Check system status" },
            { cmd: "/vibe-review", desc: "Run code review" },
            { cmd: "/vibe-build", desc: "Build project" },
            { cmd: "/vibe-autopatch", desc: "Auto-fix issues" },
          ].map((item) => (
            <button
              key={item.cmd}
              className="p-3 rounded-lg bg-background-secondary hover:bg-muted border border-border hover:border-primary/30 transition-all text-left group"
            >
              <code className="text-sm text-primary font-mono">{item.cmd}</code>
              <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
