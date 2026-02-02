import { 
  ChevronLeft, ChevronRight, Clock, Wrench, Sparkles, 
  Loader2, CheckCircle, DollarSign, Zap, Activity, Globe, ChevronDown, Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

interface AIModel {
  id: string;
  name: string;
  provider: string;
  badge?: string;
  color: string;
}

interface MonitorSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  isProcessing: boolean;
  currentStep: string;
  selectedModel: AIModel;
  onModelChange: (model: AIModel) => void;
  models: AIModel[];
  thinkingSteps: string[];
  performance: {
    totalTime: number;
    toolExecution: number;
    llmProcessing: number;
    characters: number;
    maxCharacters: number;
    inputTokens: number;
    outputTokens: number;
  };
  cost: number;
  latencyHistory: number[];
}

export function MonitorSidebar({
  collapsed,
  onToggle,
  isProcessing,
  currentStep,
  selectedModel,
  onModelChange,
  models,
  thinkingSteps,
  performance,
  cost,
  latencyHistory,
}: MonitorSidebarProps) {
  const contextUsagePercent = (performance.characters / performance.maxCharacters) * 100;
  
  // Simple sparkline visualization
  const maxLatency = Math.max(...latencyHistory, 1);

  // Group models by provider
  const modelsByProvider = models.reduce((acc, model) => {
    if (!acc[model.provider]) acc[model.provider] = [];
    acc[model.provider].push(model);
    return acc;
  }, {} as Record<string, AIModel[]>);
  
  return (
    <div className={cn(
      "border-l border-border bg-background transition-all flex flex-col",
      collapsed ? "w-12" : "w-72"
    )}>
      {/* Collapse Toggle */}
      <div className="p-2 border-b border-border flex justify-center">
        <button
          onClick={onToggle}
          className="p-1.5 rounded hover:bg-muted transition-colors"
        >
          {collapsed ? (
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
      </div>

      {!collapsed && (
        <div className="flex-1 overflow-auto p-4 space-y-5 scrollbar-thin">
          {/* Status */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</h3>
            <div className={cn(
              "p-3 rounded-lg flex items-center gap-3",
              isProcessing ? "bg-primary/10 border border-primary/20" : "bg-muted"
            )}>
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 text-primary animate-spin" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-primary">Processing</p>
                    <p className="text-xs text-muted-foreground truncate">{currentStep}</p>
                  </div>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span className="text-sm font-medium">Ready</span>
                </>
              )}
            </div>
          </div>

          {/* Model - Now clickable with dropdown */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Model</h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-full p-2.5 bg-muted hover:bg-muted/80 rounded-lg flex items-center gap-2 transition-colors group">
                  <span className={cn("w-2.5 h-2.5 rounded-full", selectedModel.color)} />
                  <span className="text-sm font-medium flex-1 text-left">{selectedModel.name}</span>
                  {selectedModel.badge && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-semibold uppercase">
                      {selectedModel.badge}
                    </span>
                  )}
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                {/* AICoding.dev Header */}
                <div className="px-3 py-2 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-cyan-400" />
                    <span className="font-bold text-cyan-400">AICoding.dev</span>
                    <span className="ml-auto flex items-center gap-1 text-xs text-emerald-400">
                      <Check className="w-3 h-3" />
                      Connected
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Multi-model AI gateway • Web-enabled
                  </p>
                </div>
                
                {Object.entries(modelsByProvider).map(([provider, providerModels], idx) => (
                  <div key={provider}>
                    {idx > 0 && <DropdownMenuSeparator />}
                    <DropdownMenuLabel className="text-xs text-muted-foreground flex items-center gap-2">
                      <Zap className="w-3 h-3" />
                      {provider}
                    </DropdownMenuLabel>
                    {providerModels.map((model) => (
                      <DropdownMenuItem
                        key={model.id}
                        onClick={() => onModelChange(model)}
                        className={cn(
                          "flex items-center justify-between gap-2 cursor-pointer",
                          selectedModel.id === model.id && "bg-primary/10"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <span className={cn("w-2 h-2 rounded-full", model.color)} />
                          <span>{model.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {model.badge && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-semibold uppercase">
                              {model.badge}
                            </span>
                          )}
                          {selectedModel.id === model.id && (
                            <Check className="w-3.5 h-3.5 text-primary" />
                          )}
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </div>
                ))}
                
                {/* Web Features */}
                <DropdownMenuSeparator />
                <div className="px-3 py-2 text-[10px] text-muted-foreground">
                  <div className="flex items-center gap-2 mb-1">
                    <Globe className="w-3 h-3 text-cyan-400" />
                    <span>Web Search Enabled</span>
                  </div>
                  <p className="text-muted-foreground/70">
                    Models can search the web for real-time information
                  </p>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Activity Log */}
          {(isProcessing || thinkingSteps.length > 0) && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Activity</h3>
              <div className="space-y-1.5 max-h-32 overflow-auto scrollbar-thin">
                {thinkingSteps.map((step, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <CheckCircle className="w-3 h-3 text-success flex-shrink-0" />
                    <span className="text-muted-foreground">{step}</span>
                  </div>
                ))}
                {isProcessing && currentStep && (
                  <div className="flex items-center gap-2 text-xs">
                    <Loader2 className="w-3 h-3 text-primary animate-spin flex-shrink-0" />
                    <span className="text-primary">{currentStep}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Cost Tracking */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Cost</h3>
            <div className="p-2.5 bg-muted rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-3.5 h-3.5 text-success" />
                <span className="text-xs">Session Total</span>
              </div>
              <span className="text-sm font-bold text-success">${cost.toFixed(4)}</span>
            </div>
          </div>

          {/* Latency Sparkline */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              Latency
            </h3>
            <div className="p-2.5 bg-muted rounded-lg">
              <div className="flex items-end gap-0.5 h-8 mb-2">
                {latencyHistory.slice(-20).map((latency, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-primary/60 rounded-t transition-all"
                    style={{ height: `${(latency / maxLatency) * 100}%` }}
                  />
                ))}
              </div>
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span>Avg: {latencyHistory.length > 0 ? Math.round(latencyHistory.reduce((a, b) => a + b, 0) / latencyHistory.length) : 0}ms</span>
                <span>Last: {latencyHistory[latencyHistory.length - 1] || 0}ms</span>
              </div>
            </div>
          </div>

          {/* Performance */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Performance</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs">Total</span>
                </div>
                <span className="text-xs font-semibold text-primary">{performance.totalTime}ms</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Wrench className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs">Tools</span>
                </div>
                <span className="text-xs font-medium">{performance.toolExecution}ms</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs">LLM</span>
                </div>
                <span className="text-xs font-medium">{performance.llmProcessing}ms</span>
              </div>
            </div>
          </div>

          {/* Tokens */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tokens</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 bg-muted rounded-lg text-center">
                <p className="text-[10px] text-muted-foreground mb-0.5">Input</p>
                <p className="text-sm font-bold">{performance.inputTokens.toLocaleString()}</p>
              </div>
              <div className="p-2.5 bg-muted rounded-lg text-center">
                <p className="text-[10px] text-muted-foreground mb-0.5">Output</p>
                <p className="text-sm font-bold">{performance.outputTokens.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Context */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Context</h3>
            <div className="p-2.5 bg-muted rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Characters</span>
                <span className="text-xs font-medium">
                  {(performance.characters / 1000).toFixed(0)}k / {(performance.maxCharacters / 1000).toFixed(0)}k
                </span>
              </div>
              <Progress value={Math.min(contextUsagePercent, 100)} className="h-1.5" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
