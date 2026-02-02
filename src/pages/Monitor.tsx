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
    <div className="p-4 rounded-xl glass border border-border">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted-foreground">{label}</span>
        <div className={cn("p-2 rounded-lg", `bg-${color}/10`)}>
          <Icon className={cn("w-4 h-4", `text-${color}`)} />
        </div>
      </div>
      <div className="flex items-end gap-1">
        <span className="text-3xl font-bold">{value}</span>
        {unit && <span className="text-sm text-muted-foreground mb-1">{unit}</span>}
      </div>
      {typeof value === "number" && (
        <Progress
          value={value}
          className={cn("h-1.5 mt-3 bg-secondary", `[&>div]:bg-${color}`)}
        />
      )}
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 glow-primary">
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Dive Monitor</h1>
            <p className="text-xs text-muted-foreground">Real-time System Metrics • V19.5</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPaused(!isPaused)}
            className={cn("border-border", isPaused && "border-yellow-500/50 text-yellow-500")}
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
      <div className="p-4 rounded-xl glass border border-primary/30 glow-primary">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-primary animate-pulse-glow" />
            <span className="font-medium">Dual Thinking Engine</span>
            <span className="px-2 py-0.5 text-xs rounded-full bg-primary/20 text-primary">
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
        <MetricCard label="Storage" value={currentMetrics.storage} unit="%" icon={HardDrive} color="green-500" />
        <MetricCard label="Network I/O" value={currentMetrics.network} unit="MB/s" icon={Wifi} color="yellow-500" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-5 rounded-xl glass border border-border">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">CPU & Memory Usage</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics}>
                <XAxis
                  dataKey="time"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(215 16% 56%)", fontSize: 10 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(215 16% 56%)", fontSize: 10 }}
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(220 18% 10%)",
                    border: "1px solid hsl(220 14% 20%)",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="cpu"
                  stroke="hsl(160 84% 39%)"
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

        <div className="p-5 rounded-xl glass border border-border">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Network Activity</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics}>
                <defs>
                  <linearGradient id="networkGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(38 92% 50%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(38 92% 50%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="time"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(215 16% 56%)", fontSize: 10 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(215 16% 56%)", fontSize: 10 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(220 18% 10%)",
                    border: "1px solid hsl(220 14% 20%)",
                    borderRadius: "8px",
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
      <div className="p-5 rounded-xl glass border border-border">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">Recent Events</h3>
        <div className="space-y-2 font-mono text-xs">
          {[
            { time: "12:45:32", type: "info", msg: "[ENGINE] Dual Thinking cycle completed" },
            { time: "12:45:30", type: "success", msg: "[TASK] Code review #247 finished" },
            { time: "12:45:28", type: "info", msg: "[METRIC] Memory usage normalized" },
            { time: "12:45:25", type: "warning", msg: "[WARN] High network latency detected" },
            { time: "12:45:20", type: "success", msg: "[BUILD] Project compiled successfully" },
          ].map((event, i) => (
            <div key={i} className="flex items-center gap-3 p-2 rounded bg-secondary/30">
              <span className="text-muted-foreground">{event.time}</span>
              <span
                className={cn(
                  "px-1.5 py-0.5 rounded text-[10px] uppercase",
                  event.type === "success" && "bg-green-500/20 text-green-500",
                  event.type === "info" && "bg-primary/20 text-primary",
                  event.type === "warning" && "bg-yellow-500/20 text-yellow-500"
                )}
              >
                {event.type}
              </span>
              <span className="text-muted-foreground">{event.msg}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
