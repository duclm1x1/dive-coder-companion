import { User, Bot, Copy, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { ThinkingBlock } from "./ThinkingBlock";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  thinking?: string;
  isStreaming?: boolean;
  isThinking?: boolean;
  thinkingDuration?: number;
  showThinking?: boolean;
}

export function MessageBubble({
  role,
  content,
  thinking,
  isStreaming,
  isThinking,
  thinkingDuration,
  showThinking = true,
}: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const isUser = role === "user";

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn(
      "flex gap-4 animate-fade-in",
      isUser ? "flex-row-reverse" : "flex-row"
    )}>
      {/* Avatar */}
      <div className={cn(
        "flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center",
        isUser
          ? "bg-primary/20 border border-primary/30"
          : "bg-secondary/20 border border-secondary/30"
      )}>
        {isUser ? (
          <User className="w-4 h-4 text-primary" />
        ) : (
          <Bot className="w-4 h-4 text-secondary" />
        )}
      </div>

      {/* Message Content */}
      <div className={cn(
        "group relative max-w-[75%] rounded-2xl px-4 py-3 transition-all",
        isUser
          ? "bg-card border border-primary/20"
          : "bg-muted/50 border border-border"
      )}>
        {isUser ? (
          <p className="text-foreground whitespace-pre-wrap">{content}</p>
        ) : (
          <>
            {/* Thinking Block */}
            {showThinking && (thinking || isThinking) && (
              <ThinkingBlock
                content={thinking || ""}
                isStreaming={isThinking}
                duration={thinkingDuration}
              />
            )}

            {/* Response Content */}
            <div className="prose prose-sm max-w-none text-foreground">
              <ReactMarkdown
                components={{
                  code: ({ className, children, ...props }) => {
                    const match = /language-(\w+)/.exec(className || "");
                    const isBlock = className?.includes("language-");

                    if (isBlock) {
                      return (
                        <div className="relative group/code">
                          <div className="absolute right-2 top-2 opacity-0 group-hover/code:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 bg-background/80"
                              onClick={() => navigator.clipboard.writeText(String(children))}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                          {match && (
                            <div className="absolute left-3 top-2 text-xs text-muted-foreground font-mono">
                              {match[1]}
                            </div>
                          )}
                          <pre className="mt-0 pt-8">
                            <code className={className} {...props}>
                              {children}
                            </code>
                          </pre>
                        </div>
                      );
                    }

                    return (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {content}
              </ReactMarkdown>
              {isStreaming && !isThinking && (
                <span className="typing-cursor" />
              )}
            </div>
          </>
        )}

        {/* Copy Button */}
        {!isStreaming && content && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute -bottom-1 -right-1 w-7 h-7 opacity-0 group-hover:opacity-100 transition-opacity bg-card hover:bg-muted"
            onClick={copyToClipboard}
          >
            {copied ? (
              <Check className="w-3 h-3 text-primary" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
