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

    // Simulate AI response
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
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border glass">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 glow-primary">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-semibold">Dive Coder AI</h1>
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
                    : "glass border border-border"
                )}
              >
                <div
                  className="text-sm whitespace-pre-wrap prose prose-invert prose-sm max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: message.content
                      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                      .replace(/`([^`]+)`/g, '<code class="bg-secondary/50 px-1 rounded">$1</code>')
                      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-secondary/50 p-3 rounded-lg mt-2 overflow-x-auto"><code>$2</code></pre>')
                      .replace(/\n/g, "<br>"),
                  }}
                />
                {message.role === "assistant" && (
                  <button
                    onClick={() => handleCopy(message.id, message.content)}
                    className="absolute top-2 right-2 p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity bg-secondary/80 hover:bg-secondary"
                  >
                    {copiedId === message.id ? (
                      <Check className="w-3.5 h-3.5 text-green-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                  </button>
                )}
                <p className="text-[10px] text-muted-foreground mt-2 opacity-60">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
              {message.role === "user" && (
                <div className="flex-shrink-0 p-2 rounded-lg bg-secondary h-fit">
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
              <div className="glass border border-border p-4 rounded-xl">
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
      <div className="p-4 border-t border-border glass">
        <div className="max-w-4xl mx-auto flex gap-3">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Dive Coder anything... (Shift+Enter for new line)"
            className="min-h-[52px] max-h-[200px] resize-none bg-secondary/50 border-border focus:border-primary/50"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-4 bg-primary hover:bg-primary/90 glow-primary"
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
