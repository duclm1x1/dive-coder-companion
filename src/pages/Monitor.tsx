import { useState, useEffect } from "react";
import { Activity, Cpu, HardDrive, MemoryStick, Wifi, RefreshCw, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

interface MetricData {
  time: string;
  cpu: number;
  memory: number;
  network: number;
}

export default function Monitor() {
  const [isPaused, setIsPaused] = useState(false);
  const [metrics, setMetrics] = useState<MetricData[]>([]);
  const [currentMetrics, setCurrentMetrics] = useState({
    cpu: 45,
    memory: 67,
    storage: 32,
    network: 78,
    processes: 124,
    threads: 892,
    uptime: "4h 23m 15s",
    engineStatus: "ACTIVE",
  });

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      const newMetric: MetricData = {
        time: new Date().toLocaleTimeString(),
        cpu: Math.floor(Math.random() * 40 + 30),
        memory: Math.floor(Math.random() * 30 + 50),
        network: Math.floor(Math.random() * 50 + 30),
      };

      setMetrics((prev) => [...prev.slice(-29), newMetric]);
      setCurrentMetrics((prev) => ({
        ...prev,
        cpu: newMetric.cpu,
        memory: newMetric.memory,
        network: newMetric.network,
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const MetricCard = ({
    label,
    value,
    unit,
    icon: Icon,
    color,
  }: {
    label: string;
    value: number | string;
    unit?: string;
    icon: typeof Cpu;
    color: string;
  }) => (
    <div className="p-4 rounded-xl bg-card border border-border hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted-foreground">{label}</span>
        <div className={cn("p-2 rounded-lg", `bg-${color}/10`)}>
          <Icon className={cn("w-4 h-4", `text-${color}`)} />
        </div>
      </div>
      <div className="flex items-end gap-1">
        <span className="text-3xl font-bold text-foreground">{value}</span>
        {unit && <span className="text-sm text-muted-foreground mb-1">{unit}</span>}
      </div>
      {typeof value === "number" && (
        <Progress
          value={value}
          className={cn("h-1.5 mt-3 bg-muted", `[&>div]:bg-${color}`)}
        />
      )}
    </div>
  );

  return (
    <div className="p-6 space-y-6 bg-background-secondary min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary text-primary-foreground">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Dive Monitor</h1>
            <p className="text-xs text-muted-foreground">Real-time System Metrics • V19.5</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPaused(!isPaused)}
            className={cn("border-border", isPaused && "border-warning text-warning")}
          >
            {isPaused ? <Play className="w-4 h-4 mr-2" /> : <Pause className="w-4 h-4 mr-2" />}
            {isPaused ? "Resume" : "Pause"}
          </Button>
          <Button variant="outline" size="sm" className="border-border">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Status Banner */}
      <div className="p-4 rounded-xl bg-success/10 border border-success/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-success animate-pulse-dot" />
            <span className="font-medium text-foreground">Dual Thinking Engine</span>
            <span className="px-2 py-0.5 text-xs rounded-full bg-success/20 text-success font-medium">
              {currentMetrics.engineStatus}
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <span>Uptime: <span className="text-foreground">{currentMetrics.uptime}</span></span>
            <span>Processes: <span className="text-foreground">{currentMetrics.processes}</span></span>
            <span>Threads: <span className="text-foreground">{currentMetrics.threads}</span></span>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="CPU Usage" value={currentMetrics.cpu} unit="%" icon={Cpu} color="primary" />
        <MetricCard label="Memory" value={currentMetrics.memory} unit="%" icon={MemoryStick} color="accent" />
        <MetricCard label="Storage" value={currentMetrics.storage} unit="%" icon={HardDrive} color="success" />
        <MetricCard label="Network I/O" value={currentMetrics.network} unit="MB/s" icon={Wifi} color="warning" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-5 rounded-xl bg-card border border-border">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">CPU & Memory Usage</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics}>
                <XAxis
                  dataKey="time"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(215 16% 47%)", fontSize: 10 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(215 16% 47%)", fontSize: 10 }}
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(0 0% 100%)",
                    border: "1px solid hsl(214 32% 91%)",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="cpu"
                  stroke="hsl(187 100% 42%)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="memory"
                  stroke="hsl(280 70% 50%)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-card border border-border">
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
                  tick={{ fill: "hsl(215 16% 47%)", fontSize: 10 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(215 16% 47%)", fontSize: 10 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(0 0% 100%)",
                    border: "1px solid hsl(214 32% 91%)",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="network"
                  stroke="hsl(38 92% 50%)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#networkGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Event Log */}
      <div className="p-5 rounded-xl bg-card border border-border">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">Recent Events</h3>
        <div className="space-y-2 font-mono text-xs">
          {[
            { time: "12:45:32", type: "info", msg: "[ENGINE] Dual Thinking cycle completed" },
            { time: "12:45:30", type: "success", msg: "[TASK] Code review #247 finished" },
            { time: "12:45:28", type: "info", msg: "[METRIC] Memory usage normalized" },
            { time: "12:45:25", type: "warning", msg: "[WARN] High network latency detected" },
            { time: "12:45:20", type: "success", msg: "[BUILD] Project compiled successfully" },
          ].map((event, i) => (
            <div key={i} className="flex items-center gap-3 p-2 rounded bg-background-secondary">
              <span className="text-muted-foreground">{event.time}</span>
              <span
                className={cn(
                  "px-1.5 py-0.5 rounded text-[10px] uppercase font-medium",
                  event.type === "success" && "bg-success/10 text-success",
                  event.type === "info" && "bg-primary/10 text-primary",
                  event.type === "warning" && "bg-warning-background text-warning"
                )}
              >
                {event.type}
              </span>
              <span className="text-foreground">{event.msg}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
