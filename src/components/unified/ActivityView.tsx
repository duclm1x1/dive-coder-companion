import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { 
  Send, User, Bot, Square,
  Loader2, ChevronDown, Settings2, Command, Globe, Zap, Check,
  Paperclip, Image, File, X, FileAudio, FileArchive, Mic, MicOff, Download
} from "lucide-react";
import { toast } from "sonner";
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
import { ThinkingPanel } from "@/components/chat/ThinkingPanel";
import { SkillsBrowser } from "@/components/chat/SkillsBrowser";
import { WorkspaceSwitcher } from "@/components/chat/WorkspaceSwitcher";
import { SLASH_COMMANDS, DIVE_CODER_VERSION } from "@/lib/dive-coder-config";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { exportToMarkdown, downloadExport, printToPDF } from "@/lib/exportChat";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

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

interface FileAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url?: string;
  file: File;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  status?: "sending" | "thinking" | "generating" | "complete" | "error";
  thinkingSteps?: string[];
  attachments?: FileAttachment[];
  thinking?: string;
  thinkingDuration?: number;
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
  const { session } = useAuth();
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
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState("default");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Voice input
  const { isListening, isSupported: voiceSupported, toggleListening, transcript } = useVoiceInput({
    onTranscript: (text) => setInput(prev => prev + text),
  });

  // Get auth token for API calls (use anon key if not authenticated)
  const getAuthToken = useCallback(() => {
    return session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  }, [session]);

  // Export chat
  const handleExport = (format: "md" | "json" | "pdf") => {
    const exportMessages = messages.map(m => ({
      role: m.role,
      content: m.content,
      timestamp: m.timestamp,
      thinking: m.thinking,
    }));
    
    if (format === "pdf") {
      printToPDF(exportMessages, { title: conversationTitle || "Dive Coder Chat", model: selectedModel.name });
    } else {
      const content = exportToMarkdown(exportMessages, { title: conversationTitle || "Dive Coder Chat", model: selectedModel.name });
      downloadExport(content, `dive-chat-${Date.now()}`, format);
    }
    toast.success(`Chat exported as ${format.toUpperCase()}`);
  };

  // Supported file types
  const SUPPORTED_TYPES = {
    image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3'],
    archive: ['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed'],
    text: ['text/plain', 'text/markdown', 'application/json'],
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const maxSize = 20 * 1024 * 1024; // 20MB
    const maxFiles = 10;

    if (attachments.length + files.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const newAttachments: FileAttachment[] = [];
    
    for (const file of files) {
      if (file.size > maxSize) {
        toast.error(`${file.name} exceeds 20MB limit`);
        continue;
      }

      const attachment: FileAttachment = {
        id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        type: file.type,
        size: file.size,
        file,
      };

      // Create preview URL for images
      if (file.type.startsWith('image/')) {
        attachment.url = URL.createObjectURL(file);
      }

      newAttachments.push(attachment);
    }

    setAttachments(prev => [...prev, ...newAttachments]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => {
      const toRemove = prev.find(a => a.id === id);
      if (toRemove?.url) URL.revokeObjectURL(toRemove.url);
      return prev.filter(a => a.id !== id);
    });
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (type.startsWith('audio/')) return <FileAudio className="w-4 h-4" />;
    if (type.includes('zip') || type.includes('rar') || type.includes('7z')) return <FileArchive className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

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

      const authToken = getAuthToken();

      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
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
    if ((!input.trim() && attachments.length === 0) || isProcessing) return;

    const userMessage = input.trim();
    const currentAttachments = [...attachments];
    setInput("");
    setAttachments([]);
    setIsProcessing(true);

    const controller = new AbortController();
    setAbortController(controller);

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: userMessage,
      timestamp: new Date(),
      status: "complete",
      attachments: currentAttachments.length > 0 ? currentAttachments : undefined,
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
      if (e.key === "Tab" || e.key === "Enter") {
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
    
    // Enter to send, Shift+Enter for new line
    if (e.key === "Enter" && !e.shiftKey) {
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
            
            <div className="relative bg-card rounded-2xl border-2 border-border/60 focus-within:border-primary focus-within:shadow-lg focus-within:shadow-primary/10 transition-all duration-200">
              {/* Attachments Preview */}
              {attachments.length > 0 && (
                <div className="p-2 border-b border-border flex flex-wrap gap-2">
                  {attachments.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-2 px-2 py-1.5 bg-muted rounded-lg text-xs group"
                    >
                      {file.url ? (
                        <img src={file.url} alt={file.name} className="w-8 h-8 rounded object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded bg-muted-foreground/10 flex items-center justify-center text-muted-foreground">
                          {getFileIcon(file.type)}
                        </div>
                      )}
                      <div className="flex flex-col min-w-0">
                        <span className="truncate max-w-[100px] font-medium">{file.name}</span>
                        <span className="text-muted-foreground text-[10px]">{formatFileSize(file.size)}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(file.id)}
                        className="p-0.5 rounded hover:bg-destructive/10 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-end">
                {/* File Upload Button */}
                <div className="p-2 flex items-center gap-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,audio/*,.txt,.md,.json,.zip,.rar,.7z"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-full h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted"
                    disabled={isProcessing}
                  >
                    <Paperclip className="w-4 h-4" />
                  </Button>
                  
                  {/* Voice Input */}
                  {voiceSupported && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={toggleListening}
                      className={cn(
                        "rounded-full h-9 w-9",
                        isListening ? "bg-red-500/10 text-red-500 hover:bg-red-500/20" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                      disabled={isProcessing}
                    >
                      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </Button>
                  )}
                  
                  {/* Export */}
                  {messages.length > 0 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="rounded-full h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleExport("md")}>Export as Markdown</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExport("json")}>Export as JSON</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExport("pdf")}>Print to PDF</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Send a message or type / for commands..."
                  className="min-h-[52px] max-h-[200px] flex-1 resize-none bg-transparent border-0 focus-visible:ring-0 focus:ring-0 ring-0 outline-none pr-12 py-3.5 text-sm placeholder:text-muted-foreground/60"
                  disabled={isProcessing}
                  rows={1}
                />
                
                <div className="p-2 flex items-center gap-2">
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
                    disabled={(!input.trim() && attachments.length === 0) || isProcessing}
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
              
              {/* Hint bar */}
              <div className="px-3 py-1.5 border-t border-border/50 flex items-center justify-between text-[10px] text-muted-foreground">
                <div className="flex items-center gap-3">
                  <span><kbd className="px-1 rounded bg-muted">Enter</kbd> to send</span>
                  <span><kbd className="px-1 rounded bg-muted">Shift+Enter</kbd> new line</span>
                  <span><kbd className="px-1 rounded bg-muted">/</kbd> commands</span>
                </div>
                <span className="text-muted-foreground/70">
                  Supports: images, audio, text, zip, rar
                </span>
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
