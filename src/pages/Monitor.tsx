import { useState, useEffect, useCallback } from "react";
import { Activity, Zap, DollarSign, CheckCircle2 } from "lucide-react";
import { MonitorHeader } from "@/components/monitor/MonitorHeader";
import { TabNavigation, TabId } from "@/components/monitor/TabNavigation";
import { StatCard } from "@/components/monitor/StatCard";
import { RecentRuns } from "@/components/monitor/RecentRuns";
import { EventList } from "@/components/monitor/EventList";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { cn } from "@/lib/utils";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

// Mock data
const mockRuns = [
  { id: '1', type: 'Code Review', status: 'success' as const, duration: '1.2s', timestamp: '12:45:32' },
  { id: '2', type: 'Build Project', status: 'running' as const, duration: 'In progress', timestamp: '12:45:28' },
  { id: '3', type: 'Deploy Staging', status: 'success' as const, duration: '3.4s', timestamp: '12:44:15' },
  { id: '4', type: 'Test Suite', status: 'failed' as const, duration: '5.1s', timestamp: '12:43:00' },
  { id: '5', type: 'Lint Check', status: 'success' as const, duration: '0.8s', timestamp: '12:42:30' },
];

const mockEvents = [
  { id: '1', type: 'success' as const, message: 'Build completed successfully', timestamp: '12:45:32', details: 'Build output: dist/\nSize: 1.2MB (gzipped: 384KB)' },
  { id: '2', type: 'info' as const, message: 'Dual Thinking Engine cycle completed', timestamp: '12:45:30' },
  { id: '3', type: 'warning' as const, message: 'High memory usage detected (78%)', timestamp: '12:45:25', details: 'Consider optimizing memory-intensive operations' },
  { id: '4', type: 'info' as const, message: 'Code review started for auth-service', timestamp: '12:45:20' },
  { id: '5', type: 'error' as const, message: 'Test suite failed: 2 tests failed', timestamp: '12:43:00', details: 'Failed tests:\n- auth.test.ts: Expected token to be valid\n- user.test.ts: Timeout exceeded' },
];

export default function Monitor() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [isPaused, setIsPaused] = useState(false);
  const [isConnected] = useState(true);
  const [metrics, setMetrics] = useState<Array<{ time: string; cpu: number; memory: number; network: number }>>([]);

  // Simulate real-time metrics
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      const newMetric = {
        time: new Date().toLocaleTimeString(),
        cpu: Math.floor(Math.random() * 40 + 30),
        memory: Math.floor(Math.random() * 30 + 50),
        network: Math.floor(Math.random() * 50 + 30),
      };
      setMetrics((prev) => [...prev.slice(-29), newMetric]);
    }, 2000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const handlePauseToggle = useCallback(() => {
    setIsPaused((prev) => !prev);
  }, []);

  const handleRefresh = useCallback(() => {
    setMetrics([]);
  }, []);

  useKeyboardShortcuts(setActiveTab, handlePauseToggle, handleRefresh);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="p-6 space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Runs"
                value={247}
                subtitle="This session"
                icon={Activity}
                color="primary"
                trend={{ value: '+12%', positive: true }}
              />
              <StatCard
                title="Success Rate"
                value="92%"
                subtitle="Last 100 runs"
                icon={CheckCircle2}
                color="success"
                trend={{ value: '+3%', positive: true }}
              />
              <StatCard
                title="Total Cost"
                value="$1.24"
                subtitle="API calls"
                icon={DollarSign}
                color="warning"
              />
              <StatCard
                title="Active Tasks"
                value={8}
                subtitle="3 pending"
                icon={Zap}
                color="accent"
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="glass-card rounded-xl p-5">
                <h3 className="text-sm font-medium text-muted-foreground mb-4">CPU & Memory Usage</h3>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={metrics}>
                      <XAxis
                        dataKey="time"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'hsl(215 16% 47%)', fontSize: 10 }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'hsl(215 16% 47%)', fontSize: 10 }}
                        domain={[0, 100]}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(0 0% 100%)',
                          border: '1px solid hsl(214 32% 91%)',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="cpu"
                        stroke="hsl(187 100% 42%)"
                        strokeWidth={2}
                        dot={false}
                        name="CPU"
                      />
                      <Line
                        type="monotone"
                        dataKey="memory"
                        stroke="hsl(160 84% 39%)"
                        strokeWidth={2}
                        dot={false}
                        name="Memory"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="glass-card rounded-xl p-5">
                <h3 className="text-sm font-medium text-muted-foreground mb-4">Network Activity</h3>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={metrics}>
                      <defs>
                        <linearGradient id="networkGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(38 92% 50%)" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="hsl(38 92% 50%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="time"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'hsl(215 16% 47%)', fontSize: 10 }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'hsl(215 16% 47%)', fontSize: 10 }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(0 0% 100%)',
                          border: '1px solid hsl(214 32% 91%)',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="network"
                        stroke="hsl(38 92% 50%)"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#networkGradient)"
                        name="Network"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Recent Runs */}
            <RecentRuns runs={mockRuns} />
          </div>
        );

      case 'activity':
        return (
          <div className="p-6 space-y-6">
            <div className="glass-card rounded-xl p-5">
              <h3 className="font-medium text-foreground mb-4">Activity Timeline</h3>
              <div className="space-y-4">
                {mockRuns.map((run, index) => (
                  <div key={run.id} className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        'w-3 h-3 rounded-full',
                        run.status === 'success' && 'bg-success glow-success',
                        run.status === 'running' && 'bg-primary animate-pulse',
                        run.status === 'failed' && 'bg-destructive'
                      )} />
                      {index < mockRuns.length - 1 && (
                        <div className="w-0.5 h-12 bg-border mt-2" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-foreground">{run.type}</p>
                        <span className="text-xs text-muted-foreground">{run.timestamp}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Duration: {run.duration}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'events':
        return (
          <div className="p-6">
            <EventList events={mockEvents} />
          </div>
        );

      case 'settings':
        return (
          <div className="p-6">
            <div className="glass-card rounded-xl p-5 space-y-6">
              <h3 className="font-medium text-foreground">Monitor Settings</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-foreground">Auto-refresh</p>
                    <p className="text-xs text-muted-foreground">Update metrics automatically</p>
                  </div>
                  <button
                    onClick={() => setIsPaused(!isPaused)}
                    className={cn(
                      'relative w-10 h-6 rounded-full transition-colors',
                      !isPaused ? 'bg-primary' : 'bg-muted'
                    )}
                  >
                    <span className={cn(
                      'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm',
                      !isPaused ? 'left-5' : 'left-1'
                    )} />
                  </button>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-foreground">Notifications</p>
                    <p className="text-xs text-muted-foreground">Show alerts for errors</p>
                  </div>
                  <button className="relative w-10 h-6 rounded-full bg-primary transition-colors">
                    <span className="absolute top-1 left-5 w-4 h-4 bg-white rounded-full shadow-sm" />
                  </button>
                </div>

                <div className="pt-4 border-t border-border">
                  <p className="text-2xs text-muted-foreground uppercase tracking-wider mb-2">Keyboard Shortcuts</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <kbd className="px-2 py-1 rounded bg-muted text-xs">1-4</kbd>
                      <span className="text-muted-foreground">Switch tabs</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <kbd className="px-2 py-1 rounded bg-muted text-xs">Space</kbd>
                      <span className="text-muted-foreground">Pause/Resume</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <kbd className="px-2 py-1 rounded bg-muted text-xs">R</kbd>
                      <span className="text-muted-foreground">Refresh</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <MonitorHeader
        isConnected={isConnected}
        workspace="dive-coder-v19.5"
        isPaused={isPaused}
        onPause={handlePauseToggle}
        onResume={handlePauseToggle}
        onCancel={() => console.log('Cancel')}
        onRerun={handleRefresh}
        onExport={() => console.log('Export')}
      />

      <TabNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <main className="flex-1 overflow-y-auto scrollbar-thin bg-background-secondary">
        {renderTabContent()}
      </main>
    </div>
  );
}
