import { useState, useRef, useEffect } from "react";
import { 
  Brain, ChevronLeft, ChevronRight, 
  Send, User, Bot, Clock, Wrench, Sparkles,
  Loader2, CheckCircle, ChevronDown, Settings2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import ReactMarkdown from "react-markdown";

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

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  status?: "sending" | "thinking" | "generating" | "complete" | "error";
  thinkingSteps?: string[];
}

interface ActivityViewProps {
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

export function ActivityView({ performance, onSendCommand }: ActivityViewProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState("");
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(false);
  const [selectedModel, setSelectedModel] = useState<AIModel>(aiModels[0]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Group models by provider
  const modelsByProvider = aiModels.reduce((acc, model) => {
    if (!acc[model.provider]) acc[model.provider] = [];
    acc[model.provider].push(model);
    return acc;
  }, {} as Record<string, AIModel[]>);

  // Simulate AI response with thinking steps
  const simulateAIResponse = async (userMessage: string) => {
    const steps = [
      "Understanding your request...",
      "Analyzing context...",
      `Using ${selectedModel.name}...`,
      "Generating response...",
    ];

    const assistantId = `msg-${Date.now()}`;
    setMessages(prev => [...prev, {
      id: assistantId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
      status: "thinking",
      thinkingSteps: [],
    }]);

    for (const step of steps) {
      setCurrentStep(step);
      await new Promise(r => setTimeout(r, 400 + Math.random() * 400));
      setMessages(prev => prev.map(m => 
        m.id === assistantId 
          ? { ...m, thinkingSteps: [...(m.thinkingSteps || []), step] }
          : m
      ));
    }

    setCurrentStep("Generating response...");
    setMessages(prev => prev.map(m => 
      m.id === assistantId ? { ...m, status: "generating" } : m
    ));

    const response = `I understand you want to: **${userMessage}**

Using **${selectedModel.name}** (${selectedModel.provider}), here's how I can help:

1. First, I'll analyze your request
2. Then I'll process the relevant information
3. Finally, I'll provide a comprehensive response

Is there anything specific you'd like me to focus on?`;

    let currentContent = "";
    for (const char of response) {
      currentContent += char;
      setMessages(prev => prev.map(m => 
        m.id === assistantId ? { ...m, content: currentContent } : m
      ));
      await new Promise(r => setTimeout(r, 10));
    }

    setMessages(prev => prev.map(m => 
      m.id === assistantId ? { ...m, status: "complete" } : m
    ));
    setCurrentStep("");
    setIsProcessing(false);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userMessage = input.trim();
    setInput("");
    setIsProcessing(true);

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: userMessage,
      timestamp: new Date(),
      status: "complete",
    };
    setMessages(prev => [...prev, userMsg]);
    onSendCommand(userMessage);
    await simulateAIResponse(userMessage);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const contextUsagePercent = ((performance.characters / performance.maxCharacters) * 100).toFixed(1);

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-auto">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4">
                <Brain className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                How can I help you today?
              </h2>
              <p className="text-muted-foreground text-center max-w-md text-sm">
                Ask me anything about coding, debugging, or building your project.
              </p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto py-6 px-4 space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-4",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-3",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    {message.role === "assistant" && message.status === "thinking" && !message.content ? (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Thinking...</span>
                      </div>
                    ) : (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown>{message.content || "..."}</ReactMarkdown>
                      </div>
                    )}
                    {message.status === "generating" && (
                      <span className="inline-block w-2 h-4 bg-primary/50 animate-pulse ml-1" />
                    )}
                  </div>
                  {message.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-foreground" />
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* AI Model Selector & Features Bar */}
        <div className="px-4 py-3 border-t border-border flex items-center justify-between gap-4 flex-wrap">
          {/* Left - Model Selector */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground font-medium">AICoding.dev:</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="gap-2 border-primary/30 hover:border-primary bg-background"
                >
                  <span className="font-medium">{selectedModel.name}</span>
                  {selectedModel.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-semibold uppercase">
                      {selectedModel.badge}
                    </span>
                  )}
                  <span className={cn("w-2 h-2 rounded-full", selectedModel.color)} />
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
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
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <Settings2 className="w-4 h-4" />
            </Button>
          </div>

        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-border">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
            <div className="relative bg-muted rounded-2xl border border-border focus-within:border-primary/50 transition-colors">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Send a message or type / for commands..."
                className="min-h-[52px] max-h-[200px] resize-none bg-transparent border-0 focus-visible:ring-0 pr-12 py-4"
                disabled={isProcessing}
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || isProcessing}
                className="absolute right-2 bottom-2 rounded-full h-9 w-9 bg-primary hover:bg-primary/90"
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Right Sidebar - Monitor */}
      <div className={cn(
        "border-l border-border bg-background transition-all flex flex-col",
        rightSidebarCollapsed ? "w-12" : "w-72"
      )}>
        {/* Collapse Toggle */}
        <div className="p-2 border-b border-border flex justify-center">
          <button
            onClick={() => setRightSidebarCollapsed(!rightSidebarCollapsed)}
            className="p-1.5 rounded hover:bg-muted"
          >
            {rightSidebarCollapsed ? (
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
        </div>

        {!rightSidebarCollapsed && (
          <div className="flex-1 overflow-auto p-4 space-y-6">
            {/* Status */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</h3>
              <div className={cn(
                "p-3 rounded-lg flex items-center gap-3",
                isProcessing ? "bg-primary/10" : "bg-muted"
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
                    <span className="text-sm">Ready</span>
                  </>
                )}
              </div>
            </div>

            {/* Current Model */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Model</h3>
              <div className="p-2 bg-muted rounded-lg flex items-center gap-2">
                <span className={cn("w-2 h-2 rounded-full", selectedModel.color)} />
                <span className="text-xs font-medium">{selectedModel.name}</span>
                {selectedModel.badge && (
                  <span className="text-[9px] px-1 py-0.5 rounded bg-primary/20 text-primary font-semibold uppercase">
                    {selectedModel.badge}
                  </span>
                )}
              </div>
            </div>

            {/* Activity Log */}
            {isProcessing && (
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Activity</h3>
                <div className="space-y-2">
                  {messages[messages.length - 1]?.thinkingSteps?.map((step, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <CheckCircle className="w-3 h-3 text-success flex-shrink-0" />
                      <span className="text-muted-foreground">{step}</span>
                    </div>
                  ))}
                  {currentStep && (
                    <div className="flex items-center gap-2 text-xs">
                      <Loader2 className="w-3 h-3 text-primary animate-spin flex-shrink-0" />
                      <span className="text-foreground">{currentStep}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Performance */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Performance</h3>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs">Total Time</span>
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
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tokens</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-muted rounded-lg text-center">
                  <p className="text-[10px] text-muted-foreground">Input</p>
                  <p className="text-sm font-bold">{performance.inputTokens}</p>
                </div>
                <div className="p-2 bg-muted rounded-lg text-center">
                  <p className="text-[10px] text-muted-foreground">Output</p>
                  <p className="text-sm font-bold">{performance.outputTokens}</p>
                </div>
              </div>
            </div>

            {/* Context */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Context</h3>
              <div className="p-2 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-muted-foreground">Characters</span>
                  <span className="text-xs font-medium">
                    {(performance.characters / 1000).toFixed(0)}k / {(performance.maxCharacters / 1000).toFixed(0)}k
                  </span>
                </div>
                <div className="w-full bg-background rounded-full h-1.5">
                  <div 
                    className="bg-primary h-1.5 rounded-full transition-all"
                    style={{ width: `${Math.min(parseFloat(contextUsagePercent), 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
