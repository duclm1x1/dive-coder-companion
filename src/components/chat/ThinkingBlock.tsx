import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronRight, Brain, Clock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThinkingBlockProps {
  content: string;
  isStreaming?: boolean;
  duration?: number;
}

export function ThinkingBlock({ content, isStreaming = false, duration }: ThinkingBlockProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (!isStreaming) return;
    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 100);
    }, 100);
    return () => clearInterval(interval);
  }, [isStreaming]);

  useEffect(() => {
    if (isStreaming) {
      setElapsedTime(0);
    }
  }, [isStreaming]);

  if (!content && !isStreaming) return null;

  const displayTime = isStreaming ? elapsedTime : (duration || 0);
  const formattedTime = (displayTime / 1000).toFixed(1);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4"
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all duration-200",
          isStreaming
            ? "bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 border border-primary/30 animate-pulse-glow"
            : "bg-muted/50 border border-border hover:border-primary/30"
        )}
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-1.5 rounded-lg",
            isStreaming ? "bg-primary/20" : "bg-muted"
          )}>
            <Brain className={cn(
              "w-4 h-4",
              isStreaming ? "text-primary animate-pulse" : "text-muted-foreground"
            )} />
          </div>
          <span className="text-sm font-medium">
            {isStreaming ? "Thinking..." : "Thought Process"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {isStreaming ? (
              <Clock className="w-3 h-3 animate-pulse" />
            ) : (
              <CheckCircle2 className="w-3 h-3 text-success" />
            )}
            <span className="font-mono">{formattedTime}s</span>
          </div>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-2 p-4 rounded-xl bg-muted/30 border border-border">
              <p className="text-sm text-muted-foreground whitespace-pre-wrap font-mono">
                {content || "Processing..."}
                {isStreaming && <span className="typing-cursor" />}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
