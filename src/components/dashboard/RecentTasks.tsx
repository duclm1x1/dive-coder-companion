import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface Task {
  id: string;
  title: string;
  status: "completed" | "running" | "failed" | "pending";
  time: string;
}

const mockTasks: Task[] = [
  { id: "1", title: "Code Review: auth-service", status: "completed", time: "2m ago" },
  { id: "2", title: "Build: frontend-v2.3", status: "running", time: "5m ago" },
  { id: "3", title: "Deploy: staging-env", status: "pending", time: "12m ago" },
  { id: "4", title: "Test: integration-suite", status: "completed", time: "18m ago" },
  { id: "5", title: "Lint: src/components", status: "failed", time: "25m ago" },
];

const statusConfig = {
  completed: {
    icon: CheckCircle2,
    color: "text-success",
    bg: "bg-success/10",
  },
  running: {
    icon: Clock,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  failed: {
    icon: AlertCircle,
    color: "text-destructive",
    bg: "bg-destructive/10",
  },
  pending: {
    icon: Clock,
    color: "text-warning",
    bg: "bg-warning-background",
  },
};

export function RecentTasks() {
  return (
    <div className="p-5 rounded-xl bg-card border border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">Recent Tasks</h3>
        <Link to="/tasks">
          <Button variant="ghost" size="sm" className="text-xs text-primary hover:text-primary/80">
            View All <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </Link>
      </div>
      <div className="space-y-2">
        {mockTasks.map((task) => {
          const config = statusConfig[task.status];
          const StatusIcon = config.icon;

          return (
            <div
              key={task.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-background-secondary hover:bg-muted transition-colors cursor-pointer"
            >
              <div className={cn("p-1.5 rounded-md", config.bg)}>
                <StatusIcon className={cn("w-4 h-4", config.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-foreground">{task.title}</p>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">{task.time}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
