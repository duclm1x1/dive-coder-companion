import { useState, useRef, useEffect, useCallback } from "react";
import { 
  Send, User, Bot, Square,
  Loader2, ChevronDown, Settings2
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
import { CodeBlock } from "@/components/chat/CodeBlock";
import { WelcomeHero } from "@/components/chat/WelcomeHero";
import { MonitorSidebar } from "@/components/chat/MonitorSidebar";

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
  const [sessionCost, setSessionCost] = useState(0);
  const [latencyHistory, setLatencyHistory] = useState<number[]>([]);
  const [conversationTitle, setConversationTitle] = useState("");
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Group models by provider
  const modelsByProvider = aiModels.reduce((acc, model) => {
    if (!acc[model.provider]) acc[model.provider] = [];
    acc[model.provider].push(model);
    return acc;
  }, {} as Record<string, AIModel[]>);

  const stopGeneration = useCallback(() => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setIsProcessing(false);
      setCurrentStep("");
      // Mark last message as complete
      setMessages(prev => prev.map((m, i) => 
        i === prev.length - 1 && m.role === "assistant" 
          ? { ...m, status: "complete" as const }
          : m
      ));
    }
  }, [abortController]);

  // Simulate AI response with thinking steps
  const simulateAIResponse = async (userMessage: string, signal: AbortSignal) => {
    const startTime = Date.now();
    const steps = [
      "Understanding your request...",
      "Analyzing context...",
      `Using ${selectedModel.name}...`,
      "Processing with AI...",
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

    // Set conversation title from first message
    if (!conversationTitle) {
      setConversationTitle(userMessage.slice(0, 50) + (userMessage.length > 50 ? "..." : ""));
    }

    try {
      for (const step of steps) {
        if (signal.aborted) return;
        setCurrentStep(step);
        await new Promise((r, reject) => {
          const timeout = setTimeout(r, 300 + Math.random() * 300);
          signal.addEventListener('abort', () => {
            clearTimeout(timeout);
            reject(new DOMException('Aborted', 'AbortError'));
          });
        });
        setMessages(prev => prev.map(m => 
          m.id === assistantId 
            ? { ...m, thinkingSteps: [...(m.thinkingSteps || []), step] }
            : m
        ));
      }

      if (signal.aborted) return;

      setCurrentStep("Generating response...");
      setMessages(prev => prev.map(m => 
        m.id === assistantId ? { ...m, status: "generating" } : m
      ));

      const response = `I understand you want to: **${userMessage}**

Using **${selectedModel.name}** (${selectedModel.provider}), here's an example:

\`\`\`typescript
// Example code snippet
function processRequest(input: string): Promise<Result> {
  const processed = analyzeInput(input);
  return generateOutput(processed);
}

// Usage
const result = await processRequest("${userMessage.slice(0, 20)}...");
console.log(result);
\`\`\`

**Key points:**
1. First, I'll analyze your request
2. Then I'll process the relevant information
3. Finally, I'll provide a comprehensive response

Is there anything specific you'd like me to focus on?`;

      let currentContent = "";
      for (const char of response) {
        if (signal.aborted) return;
        currentContent += char;
        setMessages(prev => prev.map(m => 
          m.id === assistantId ? { ...m, content: currentContent } : m
        ));
        await new Promise(r => setTimeout(r, 8));
      }

      const endTime = Date.now();
      const latency = endTime - startTime;
      setLatencyHistory(prev => [...prev.slice(-19), latency]);
      setSessionCost(prev => prev + 0.002); // Simulated cost

      setMessages(prev => prev.map(m => 
        m.id === assistantId ? { ...m, status: "complete" } : m
      ));
    } catch (e) {
      if ((e as Error).name === 'AbortError') return;
      throw e;
    } finally {
      setCurrentStep("");
      setIsProcessing(false);
      setAbortController(null);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userMessage = input.trim();
    setInput("");
    setIsProcessing(true);

    const controller = new AbortController();
    setAbortController(controller);

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: userMessage,
      timestamp: new Date(),
      status: "complete",
    };
    setMessages(prev => [...prev, userMsg]);
    onSendCommand(userMessage);
    
    await simulateAIResponse(userMessage, controller.signal);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSelectPrompt = (prompt: string) => {
    setInput(prompt);
    textareaRef.current?.focus();
  };

  // Get current thinking steps for sidebar
  const currentThinkingSteps = messages.length > 0 && messages[messages.length - 1].role === "assistant"
    ? messages[messages.length - 1].thinkingSteps || []
    : [];

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Conversation Title Bar */}
        {conversationTitle && (
          <div className="px-4 py-2 border-b border-border bg-background/50">
            <p className="text-sm font-medium text-foreground truncate max-w-xl">{conversationTitle}</p>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-auto">
          {messages.length === 0 ? (
            <WelcomeHero onSelectPrompt={handleSelectPrompt} />
          ) : (
            <div className="max-w-3xl mx-auto py-6 px-4 space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-4 animate-fade-in",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <Bot className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-3",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-card border border-border"
                    )}
                  >
                    {message.role === "assistant" && message.status === "thinking" && !message.content ? (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Thinking...</span>
                      </div>
                    ) : (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown
                          components={{
                            code({ className, children, ...props }) {
                              const match = /language-(\w+)/.exec(className || '');
                              const isInline = !match;
                              return isInline ? (
                                <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                                  {children}
                                </code>
                              ) : (
                                <CodeBlock language={match[1]}>
                                  {String(children).replace(/\n$/, '')}
                                </CodeBlock>
                              );
                            },
                          }}
                        >
                          {message.content || "..."}
                        </ReactMarkdown>
                      </div>
                    )}
                    {message.status === "generating" && (
                      <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1 rounded-sm" />
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

        {/* AI Model Selector */}
        <div className="px-4 py-2 border-t border-border flex items-center gap-4">
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
            <div className="relative bg-card rounded-2xl border border-border focus-within:border-primary/50 focus-within:shadow-glow transition-all">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Send a message... (⌘+Enter to send)"
                className="min-h-[56px] max-h-[200px] resize-none bg-transparent border-0 focus-visible:ring-0 pr-24 py-4 text-sm"
                disabled={isProcessing}
              />
              <div className="absolute right-2 bottom-2 flex items-center gap-2">
                {isProcessing && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={stopGeneration}
                    className="rounded-full h-9 w-9 hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Square className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  type="submit"
                  size="icon"
                  disabled={!input.trim() || isProcessing}
                  className="rounded-full h-9 w-9 bg-primary hover:bg-primary/90 shadow-sm"
                >
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Right Sidebar - Monitor */}
      <MonitorSidebar
        collapsed={rightSidebarCollapsed}
        onToggle={() => setRightSidebarCollapsed(!rightSidebarCollapsed)}
        isProcessing={isProcessing}
        currentStep={currentStep}
        selectedModel={selectedModel}
        thinkingSteps={currentThinkingSteps}
        performance={performance}
        cost={sessionCost}
        latencyHistory={latencyHistory}
      />
    </div>
  );
}
