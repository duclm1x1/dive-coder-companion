import { useState } from "react";
import { GitBranch, CheckCircle2, Clock, AlertCircle, Plus, Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Task {
  id: string;
  title: string;
  description: string;
  status: "completed" | "running" | "pending" | "failed";
  priority: "high" | "medium" | "low";
  type: "review" | "build" | "deploy" | "test";
  createdAt: string;
  duration?: string;
}

const mockTasks: Task[] = [
  {
    id: "1",
    title: "Code Review: auth-service",
    description: "Review authentication module for security vulnerabilities",
    status: "completed",
    priority: "high",
    type: "review",
    createdAt: "2 minutes ago",
    duration: "1m 23s",
  },
  {
    id: "2",
    title: "Build: frontend-v2.3",
    description: "Production build with optimizations",
    status: "running",
    priority: "high",
    type: "build",
    createdAt: "5 minutes ago",
  },
  {
    id: "3",
    title: "Deploy: staging-environment",
    description: "Deploy latest changes to staging",
    status: "pending",
    priority: "medium",
    type: "deploy",
    createdAt: "12 minutes ago",
  },
  {
    id: "4",
    title: "Test: integration-suite",
    description: "Run full integration test suite",
    status: "completed",
    priority: "medium",
    type: "test",
    createdAt: "18 minutes ago",
    duration: "3m 45s",
  },
  {
    id: "5",
    title: "Code Review: api-endpoints",
    description: "Review new API endpoints for best practices",
    status: "failed",
    priority: "high",
    type: "review",
    createdAt: "25 minutes ago",
  },
  {
    id: "6",
    title: "Build: mobile-app",
    description: "Build mobile application bundle",
    status: "pending",
    priority: "low",
    type: "build",
    createdAt: "30 minutes ago",
  },
];

const statusConfig = {
  completed: { icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10", label: "Completed" },
  running: { icon: Clock, color: "text-primary", bg: "bg-primary/10", label: "Running" },
  pending: { icon: Clock, color: "text-yellow-500", bg: "bg-yellow-500/10", label: "Pending" },
  failed: { icon: AlertCircle, color: "text-red-500", bg: "bg-red-500/10", label: "Failed" },
};

const priorityConfig = {
  high: { color: "text-red-500", bg: "bg-red-500/10" },
  medium: { color: "text-yellow-500", bg: "bg-yellow-500/10" },
  low: { color: "text-green-500", bg: "bg-green-500/10" },
};

export default function Tasks() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const filteredTasks = mockTasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "all" || task.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const stats = {
    total: mockTasks.length,
    completed: mockTasks.filter((t) => t.status === "completed").length,
    running: mockTasks.filter((t) => t.status === "running").length,
    pending: mockTasks.filter((t) => t.status === "pending").length,
    failed: mockTasks.filter((t) => t.status === "failed").length,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 glow-primary">
            <GitBranch className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Task Manager</h1>
            <p className="text-xs text-muted-foreground">Orchestration & Tracking • V19.5</p>
          </div>
        </div>
        <Button className="bg-primary hover:bg-primary/90 glow-primary">
          <Plus className="w-4 h-4 mr-2" />
          New Task
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Total", value: stats.total, color: "text-foreground" },
          { label: "Completed", value: stats.completed, color: "text-green-500" },
          { label: "Running", value: stats.running, color: "text-primary" },
          { label: "Pending", value: stats.pending, color: "text-yellow-500" },
          { label: "Failed", value: stats.failed, color: "text-red-500" },
        ].map((stat) => (
          <div key={stat.label} className="p-4 rounded-xl glass border border-border text-center">
            <p className={cn("text-2xl font-bold", stat.color)}>{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-secondary/50 border-border"
          />
        </div>
        <Button variant="outline" size="sm" className="border-border">
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-secondary/50">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="running">Running</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="failed">Failed</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <div className="space-y-3">
            {filteredTasks.map((task) => {
              const status = statusConfig[task.status];
              const priority = priorityConfig[task.priority];
              const StatusIcon = status.icon;

              return (
                <div
                  key={task.id}
                  className="p-4 rounded-xl glass border border-border hover:border-primary/30 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={cn("p-2 rounded-lg mt-0.5", status.bg)}>
                        <StatusIcon className={cn("w-4 h-4", status.color)} />
                      </div>
                      <div>
                        <h3 className="font-medium">{task.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                        <div className="flex items-center gap-3 mt-3">
                          <span className={cn("px-2 py-0.5 rounded text-xs", priority.bg, priority.color)}>
                            {task.priority}
                          </span>
                          <span className="px-2 py-0.5 rounded text-xs bg-secondary text-muted-foreground">
                            {task.type}
                          </span>
                          <span className="text-xs text-muted-foreground">{task.createdAt}</span>
                          {task.duration && (
                            <span className="text-xs text-muted-foreground">• {task.duration}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className={cn("px-2 py-1 rounded-lg text-xs", status.bg, status.color)}>
                      {status.label}
                    </span>
                  </div>
                </div>
              );
            })}

            {filteredTasks.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <GitBranch className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No tasks found</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
