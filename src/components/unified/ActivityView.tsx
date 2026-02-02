import { useState } from "react";
import { 
  Brain, Zap, Clock, Radio, ChevronLeft, ChevronRight, 
  Send, Wrench, Sparkles, FileText, ChevronDown, Settings2,
  Database, Grid3X3, Circle, Cpu
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

type SubTabId = "progress" | "complete" | "timeline" | "events";

const subTabs = [
  { id: "progress" as SubTabId, label: "AI PROGRESS", icon: Sparkles },
  { id: "complete" as SubTabId, label: "COMPLETE", icon: Zap },
  { id: "timeline" as SubTabId, label: "Timeline", icon: Clock },
  { id: "events" as SubTabId, label: "Events", icon: Radio },
];

interface AIModel {
  id: string;
  name: string;
  provider: string;
  badge?: string;
  color: string;
}

const aiModels: AIModel[] = [
  { id: "gemini-3-flash", name: "Gemini 3 Flash", provider: "Google", badge: "fast", color: "bg-blue-500" },
  { id: "gemini-3-pro", name: "Gemini 3 Pro", provider: "Google", badge: "pro", color: "bg-blue-600" },
  { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", provider: "Google", badge: "pro", color: "bg-indigo-500" },
  { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", provider: "Google", color: "bg-indigo-400" },
  { id: "gpt-5", name: "GPT-5", provider: "OpenAI", badge: "pro", color: "bg-emerald-500" },
  { id: "gpt-5-mini", name: "GPT-5 Mini", provider: "OpenAI", color: "bg-emerald-400" },
  { id: "gpt-5.2", name: "GPT-5.2", provider: "OpenAI", badge: "latest", color: "bg-green-500" },
  { id: "claude-sonnet", name: "Claude Sonnet 4.5", provider: "Anthropic", badge: "pro", color: "bg-orange-500" },
  { id: "claude-opus", name: "Claude Opus 4", provider: "Anthropic", badge: "pro", color: "bg-orange-600" },
];

interface FeatureToggle {
  id: string;
  label: string;
  icon: React.ReactNode;
  enabled: boolean;
}

interface Task {
  id: string;
  title: string;
  status: "pending" | "running" | "completed" | "failed";
}

interface ActivityViewProps {
  tasks: Task[];
  performance: {
    totalTime: number;
    toolExecution: number;
    llmProcessing: number;
    characters: number;
    maxCharacters: number;
    inputTokens: number;
    outputTokens: number;
    p50Latency: number;
    p95Latency: number;
  };
  onSendCommand: (command: string) => void;
}

export function ActivityView({ tasks, performance, onSendCommand }: ActivityViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<SubTabId>("complete");
  const [command, setCommand] = useState("");
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [selectedModel, setSelectedModel] = useState<AIModel>(aiModels[0]);
  const [features, setFeatures] = useState<FeatureToggle[]>([
    { id: "rag", label: "RAG", icon: <Database className="w-3.5 h-3.5" />, enabled: false },
    { id: "cpcg", label: "CPCG", icon: <Grid3X3 className="w-3.5 h-3.5" />, enabled: false },
    { id: "shc", label: "SHC", icon: <Circle className="w-3.5 h-3.5" />, enabled: false },
    { id: "dual-think", label: "Dual Think", icon: <Cpu className="w-3.5 h-3.5" />, enabled: true },
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (command.trim()) {
      onSendCommand(command);
      setCommand("");
    }
  };

  const toggleFeature = (id: string) => {
    setFeatures(prev => 
      prev.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f)
    );
  };

  const contextUsagePercent = ((performance.characters / performance.maxCharacters) * 100).toFixed(1);

  // Group models by provider
  const modelsByProvider = aiModels.reduce((acc, model) => {
    if (!acc[model.provider]) acc[model.provider] = [];
    acc[model.provider].push(model);
    return acc;
  }, {} as Record<string, AIModel[]>);

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Left Sidebar - Tasks */}
      <div className={cn(
        "border-r border-border bg-background flex flex-col transition-all",
        leftSidebarCollapsed ? "w-12" : "w-64"
      )}>
        {/* Collapse Toggle */}
        <div className="flex items-center justify-between p-2 border-b border-border">
          <button
            onClick={() => setLeftSidebarCollapsed(!leftSidebarCollapsed)}
            className="p-1.5 rounded hover:bg-muted"
          >
            {leftSidebarCollapsed ? (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
        </div>

        {/* Tasks List */}
        <div className="flex-1 overflow-auto p-3">
          {!leftSidebarCollapsed && (
            <>
              {tasks.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm font-medium text-foreground">No tasks yet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your tasks will appear here when Dive Coder starts working
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className={cn(
                        "p-2 rounded-lg text-sm border",
                        task.status === "running" && "bg-primary/10 border-primary/20",
                        task.status === "completed" && "bg-success/10 border-success/20",
                        task.status === "failed" && "bg-destructive/10 border-destructive/20",
                        task.status === "pending" && "bg-muted border-border"
                      )}
                    >
                      {task.title}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Center - Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Sub Tabs */}
        <div className="flex items-center gap-4 px-4 py-3 border-b border-border">
          {subTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 text-sm font-medium transition-all pb-2 border-b-2",
                  isActive
                    ? "text-foreground border-primary"
                    : "text-muted-foreground border-transparent hover:text-foreground"
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-auto">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
            <Brain className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Waiting for DiveCoder to start...
          </h2>
          <p className="text-muted-foreground text-center max-w-md">
            The thinking panel will show AI reasoning when a task is running
          </p>
        </div>

        {/* AI Model Selector & Features Bar */}
        <div className="px-4 py-3 border-t border-border flex items-center justify-between gap-4">
          {/* Left - Model Selector */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">AICoding.dev:</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="gap-2 border-primary/30 hover:border-primary bg-background"
                >
                  <span className="font-medium">{selectedModel.name}</span>
                  {selectedModel.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-semibold uppercase">
                      {selectedModel.badge}
                    </span>
                  )}
                  <span className={cn("w-2.5 h-2.5 rounded-full", selectedModel.color)} />
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64">
                {Object.entries(modelsByProvider).map(([provider, models], idx) => (
                  <div key={provider}>
                    {idx > 0 && <DropdownMenuSeparator />}
                    <DropdownMenuLabel className="text-xs text-muted-foreground">{provider}</DropdownMenuLabel>
                    {models.map((model) => (
                      <DropdownMenuItem
                        key={model.id}
                        onClick={() => setSelectedModel(model)}
                        className={cn(
                          "flex items-center justify-between gap-2",
                          selectedModel.id === model.id && "bg-primary/10"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <span className={cn("w-2 h-2 rounded-full", model.color)} />
                          <span>{model.name}</span>
                        </div>
                        {model.badge && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-semibold uppercase">
                            {model.badge}
                          </span>
                        )}
                      </DropdownMenuItem>
                    ))}
                  </div>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <Settings2 className="w-4 h-4" />
            </Button>
          </div>

          {/* Right - Feature Toggles */}
          <div className="flex items-center gap-2">
            {features.map((feature) => (
              <Button
                key={feature.id}
                variant="outline"
                size="sm"
                onClick={() => toggleFeature(feature.id)}
                className={cn(
                  "gap-1.5 text-xs font-medium transition-all",
                  feature.enabled
                    ? "border-primary bg-primary/10 text-primary hover:bg-primary/20"
                    : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                {feature.icon}
                {feature.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Command Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-border">
          <div className="flex items-center gap-2 bg-muted rounded-lg px-4 py-3">
            <span className="text-primary font-mono text-sm">⌘</span>
            <Input
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="Send a message or type / for commands..."
              className="flex-1 bg-transparent border-0 focus-visible:ring-0 text-sm"
            />
            <Button 
              type="submit" 
              size="icon" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full h-9 w-9"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </div>

      {/* Right Sidebar - Performance */}
      <div className="w-72 border-l border-border bg-background overflow-auto p-4 space-y-6">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Performance</h3>

        {/* Total Time */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wide">Total Time</span>
          </div>
          <p className="text-2xl font-bold text-primary">{performance.totalTime}ms</p>
        </div>

        {/* Time Breakdown */}
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">How Time Was Spent</p>
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Tool Execution</span>
            </div>
            <span className="text-sm font-medium">{performance.toolExecution}ms</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">LLM Processing</span>
            </div>
            <span className="text-sm font-medium">{performance.llmProcessing}ms</span>
          </div>
        </div>

        {/* Context Usage */}
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Context Usage</p>
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Characters</span>
              </div>
              <span className="text-sm font-medium">
                {(performance.characters / 1000).toFixed(0)}/{(performance.maxCharacters / 1000).toFixed(1)}k
              </span>
            </div>
            <div className="w-full bg-background rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${contextUsagePercent}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground text-right mt-1">{contextUsagePercent}% used</p>
          </div>
        </div>

        {/* Token Usage */}
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Token Usage</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 bg-muted rounded-lg text-center">
              <p className="text-xs text-muted-foreground">Input</p>
              <p className="text-lg font-bold">{performance.inputTokens}</p>
            </div>
            <div className="p-3 bg-muted rounded-lg text-center">
              <p className="text-xs text-muted-foreground">Output</p>
              <p className="text-lg font-bold">{performance.outputTokens}</p>
            </div>
          </div>
        </div>

        {/* Latency */}
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Latency</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 bg-muted rounded-lg text-center">
              <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                <Sparkles className="w-3 h-3" />
                <span className="text-xs">p50</span>
              </div>
              <p className="text-lg font-bold">{performance.p50Latency}ms</p>
            </div>
            <div className="p-3 bg-muted rounded-lg text-center">
              <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                <Clock className="w-3 h-3" />
                <span className="text-xs">p95</span>
              </div>
              <p className="text-lg font-bold text-primary">{performance.p95Latency}ms</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
