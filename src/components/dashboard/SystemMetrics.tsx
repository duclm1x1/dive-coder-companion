import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Cpu, HardDrive, MemoryStick, Wifi } from "lucide-react";

interface Metric {
  label: string;
  value: number;
  icon: typeof Cpu;
  color: "primary" | "accent" | "warning" | "success";
}

const metrics: Metric[] = [
  { label: "CPU Usage", value: 45, icon: Cpu, color: "primary" },
  { label: "Memory", value: 67, icon: MemoryStick, color: "accent" },
  { label: "Storage", value: 32, icon: HardDrive, color: "success" },
  { label: "Network", value: 78, icon: Wifi, color: "warning" },
];

const colorStyles = {
  primary: {
    text: "text-primary",
    bg: "bg-primary/10",
    progress: "[&>div]:bg-primary",
  },
  accent: {
    text: "text-accent",
    bg: "bg-accent/10",
    progress: "[&>div]:bg-accent",
  },
  warning: {
    text: "text-warning",
    bg: "bg-warning-background",
    progress: "[&>div]:bg-warning",
  },
  success: {
    text: "text-success",
    bg: "bg-success/10",
    progress: "[&>div]:bg-success",
  },
};

export function SystemMetrics() {
  return (
    <div className="p-5 rounded-xl bg-card border border-border">
      <h3 className="text-sm font-medium text-muted-foreground mb-4">System Metrics</h3>
      <div className="space-y-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          const styles = colorStyles[metric.color];

          return (
            <div key={metric.label} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn("p-1.5 rounded-md", styles.bg)}>
                    <Icon className={cn("w-3.5 h-3.5", styles.text)} />
                  </div>
                  <span className="text-sm text-foreground">{metric.label}</span>
                </div>
                <span className={cn("text-sm font-medium", styles.text)}>{metric.value}%</span>
              </div>
              <Progress value={metric.value} className={cn("h-1.5 bg-muted", styles.progress)} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
