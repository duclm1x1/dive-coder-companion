import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { 
  Send, User, Bot, Square,
  Loader2, ChevronDown, Settings2, Command, Globe, Zap, Check
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
import { SLASH_COMMANDS, DIVE_CODER_VERSION } from "@/lib/dive-coder-config";

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
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Filter commands based on input
  const filteredCommands = useMemo(() => {
    if (!input.startsWith('/')) return [];
    const query = input.toLowerCase();
    return SLASH_COMMANDS.filter(cmd => 
      cmd.command.toLowerCase().includes(query) || 
      cmd.description.toLowerCase().includes(query)
    ).slice(0, 6);
  }, [input]);

  // Show command palette when typing /
  useEffect(() => {
    setShowCommandPalette(input.startsWith('/') && filteredCommands.length > 0);
    setSelectedCommandIndex(0);
  }, [input, filteredCommands.length]);

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

  // Real AI response with streaming
  const streamAIResponse = async (userMessage: string, signal: AbortSignal) => {
    const startTime = Date.now();
    const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
    
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

    // Show thinking steps
    const steps = [
      "Understanding your request...",
      `Connecting to ${selectedModel.name}...`,
      "Processing with AI...",
    ];

    try {
      for (const step of steps) {
        if (signal.aborted) return;
        setCurrentStep(step);
        await new Promise((r, reject) => {
          const timeout = setTimeout(r, 200);
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

      // Build conversation history
      const conversationHistory = messages
        .filter(m => m.status === "complete")
        .map(m => ({ role: m.role, content: m.content }));

      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [...conversationHistory, { role: "user", content: userMessage }],
          model: selectedModel.id,
        }),
        signal,
      });

      if (!response.ok || !response.body) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Request failed: ${response.status}`);
      }

      // Stream the response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let assistantContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages(prev => prev.map(m => 
                m.id === assistantId ? { ...m, content: assistantContent } : m
              ));
            }
          } catch {
            // Incomplete JSON, put it back
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      const endTime = Date.now();
      const latency = endTime - startTime;
      setLatencyHistory(prev => [...prev.slice(-19), latency]);
      
      // Calculate approximate cost based on response length
      const tokenEstimate = Math.ceil(assistantContent.length / 4);
      const costEstimate = tokenEstimate * 0.000001; // Rough estimate
      setSessionCost(prev => prev + costEstimate);

      setMessages(prev => prev.map(m => 
        m.id === assistantId ? { ...m, status: "complete" } : m
      ));
    } catch (e) {
      if ((e as Error).name === 'AbortError') return;
      
      console.error("AI response error:", e);
      const errorMessage = e instanceof Error ? e.message : "Failed to get AI response";
      
      // Show error in the message
      setMessages(prev => prev.map(m => 
        m.id === assistantId 
          ? { ...m, content: `⚠️ Error: ${errorMessage}`, status: "error" as const }
          : m
      ));
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
    
    await streamAIResponse(userMessage, controller.signal);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle command palette navigation
    if (showCommandPalette) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedCommandIndex(prev => 
          prev < filteredCommands.length - 1 ? prev + 1 : 0
        );
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedCommandIndex(prev => 
          prev > 0 ? prev - 1 : filteredCommands.length - 1
        );
        return;
      }
      if (e.key === "Tab" || (e.key === "Enter" && !e.metaKey && !e.ctrlKey)) {
        e.preventDefault();
        const selectedCmd = filteredCommands[selectedCommandIndex];
        if (selectedCmd) {
          setInput(selectedCmd.command + " ");
          setShowCommandPalette(false);
        }
        return;
      }
      if (e.key === "Escape") {
        setShowCommandPalette(false);
        return;
      }
    }
    
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const selectCommand = (cmd: typeof SLASH_COMMANDS[0]) => {
    setInput(cmd.command + " ");
    setShowCommandPalette(false);
    textareaRef.current?.focus();
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

        {/* AI Status Bar */}
        <div className="px-4 py-2 border-t border-border flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-xs font-bold text-cyan-400">AICoding.dev</span>
              <span className="text-muted-foreground">•</span>
              <span className="flex items-center gap-1 text-xs text-emerald-400">
                <Check className="w-3 h-3" />
                Connected
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className={cn("w-2 h-2 rounded-full", selectedModel.color)} />
              <span>{selectedModel.name}</span>
              {selectedModel.badge && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-semibold uppercase">
                  {selectedModel.badge}
                </span>
              )}
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <Settings2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-border">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto relative">
            {/* Command Palette */}
            {showCommandPalette && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-card border border-border rounded-xl shadow-lg overflow-hidden animate-fade-in z-10">
                <div className="p-2 border-b border-border bg-muted/50">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Command className="w-3.5 h-3.5" />
                    <span>Dive Coder {DIVE_CODER_VERSION} Commands</span>
                  </div>
                </div>
                <div className="max-h-64 overflow-auto">
                  {filteredCommands.map((cmd, idx) => (
                    <button
                      key={cmd.command}
                      type="button"
                      onClick={() => selectCommand(cmd)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 text-left transition-colors",
                        idx === selectedCommandIndex 
                          ? "bg-primary/10 text-primary" 
                          : "hover:bg-muted"
                      )}
                    >
                      <span className="font-mono text-sm font-medium">{cmd.command}</span>
                      <span className="text-xs text-muted-foreground flex-1">{cmd.description}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                        {cmd.category}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="p-2 border-t border-border bg-muted/30 text-[10px] text-muted-foreground flex items-center gap-4">
                  <span><kbd className="px-1 rounded bg-muted">↑↓</kbd> navigate</span>
                  <span><kbd className="px-1 rounded bg-muted">Tab</kbd> select</span>
                  <span><kbd className="px-1 rounded bg-muted">Esc</kbd> close</span>
                </div>
              </div>
            )}
            
            <div className="relative bg-card rounded-2xl border border-border focus-within:border-primary/50 focus-within:shadow-glow transition-all">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Send a message or type / for commands..."
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
        onModelChange={setSelectedModel}
        models={aiModels}
        thinkingSteps={currentThinkingSteps}
        performance={performance}
        cost={sessionCost}
        latencyHistory={latencyHistory}
      />
    </div>
  );
}
