import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, Copy, Check, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const initialMessages: Message[] = [
  {
    id: "1",
    role: "assistant",
    content: "👋 Welcome to **Dive Coder V19.5**!\n\nI'm your AI coding assistant powered by the Dual Thinking Engine. I can help you with:\n\n- 🔍 Code review and analysis\n- 🐛 Debugging and troubleshooting\n- ✨ Code generation and refactoring\n- 📚 Documentation and explanations\n\nTry commands like `/vibe-review` or `/vibe-status` for quick actions!",
    timestamp: new Date(),
  },
];

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    setTimeout(() => {
      const responses = [
        "I've analyzed your request. Based on the Dual Thinking Engine's assessment:\n\n**Primary Analysis:**\n- Code structure follows best practices\n- No critical vulnerabilities detected\n- Recommended optimizations identified\n\n**Secondary Review:**\nThe codebase shows good modularity. Consider implementing unit tests for the new components.",
        "Running `/vibe-review` on your codebase...\n\n✅ **Passed:** 47 checks\n⚠️ **Warnings:** 3 items\n❌ **Errors:** 0 items\n\nOverall code health: **92%**\n\nWould you like me to auto-fix the warnings with `/vibe-autopatch`?",
        "Here's the optimized version of your code:\n\n```typescript\nconst processData = async (data: DataType[]) => {\n  return data\n    .filter(item => item.active)\n    .map(item => transform(item))\n    .reduce((acc, curr) => merge(acc, curr), {});\n};\n```\n\nThis version uses functional chaining for better readability and performance.",
      ];

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background-secondary">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary text-primary-foreground">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-semibold text-foreground">Dive Coder AI</h1>
            <p className="text-xs text-muted-foreground">Dual Thinking Engine • V19.5</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {message.role === "assistant" && (
                <div className="flex-shrink-0 p-2 rounded-lg bg-primary/10 h-fit">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[80%] p-4 rounded-xl relative group",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border"
                )}
              >
                <div
                  className={cn(
                    "text-sm whitespace-pre-wrap prose prose-sm max-w-none",
                    message.role === "user" ? "prose-invert" : ""
                  )}
                  dangerouslySetInnerHTML={{
                    __html: message.content
                      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                      .replace(/`([^`]+)`/g, `<code class="${message.role === 'user' ? 'bg-white/20' : 'bg-muted'} px-1 rounded text-${message.role === 'user' ? 'white' : 'primary'}">$1</code>`)
                      .replace(/```(\w+)?\n([\s\S]*?)```/g, `<pre class="${message.role === 'user' ? 'bg-white/10' : 'bg-muted'} p-3 rounded-lg mt-2 overflow-x-auto"><code>$2</code></pre>`)
                      .replace(/\n/g, "<br>"),
                  }}
                />
                {message.role === "assistant" && (
                  <button
                    onClick={() => handleCopy(message.id, message.content)}
                    className="absolute top-2 right-2 p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity bg-muted hover:bg-muted/80"
                  >
                    {copiedId === message.id ? (
                      <Check className="w-3.5 h-3.5 text-success" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                  </button>
                )}
                <p className={cn(
                  "text-[10px] mt-2 opacity-60",
                  message.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                )}>
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
              {message.role === "user" && (
                <div className="flex-shrink-0 p-2 rounded-lg bg-muted h-fit">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className="flex-shrink-0 p-2 rounded-lg bg-primary/10 h-fit">
                <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              </div>
              <div className="bg-card border border-border p-4 rounded-xl">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border bg-card">
        <div className="max-w-4xl mx-auto flex gap-3">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Dive Coder anything... (Shift+Enter for new line)"
            className="min-h-[52px] max-h-[200px] resize-none bg-background-secondary border-border focus:border-primary"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-4 bg-primary hover:bg-primary/90"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-center text-[10px] text-muted-foreground mt-2">
          Dive Coder V19.5 • Dual Thinking Engine • Press Enter to send
        </p>
      </div>
    </div>
  );
}
