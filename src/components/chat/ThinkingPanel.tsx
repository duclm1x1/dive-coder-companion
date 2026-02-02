import { useState } from "react";
import { ChevronDown, ChevronRight, Brain, Loader2, Clock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface ThinkingStep {
  id: string;
  content: string;
  timestamp: Date;
  type: "reasoning" | "search" | "tool" | "analysis";
}

interface ThinkingPanelProps {
  isThinking: boolean;
  thinkingContent?: string;
  thinkingSteps?: ThinkingStep[];
  thinkingDuration?: number;
  className?: string;
}

export function ThinkingPanel({
  isThinking,
  thinkingContent,
  thinkingSteps = [],
  thinkingDuration,
  className,
}: ThinkingPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!isThinking && !thinkingContent && thinkingSteps.length === 0) {
    return null;
  }

  const getStepIcon = (type: ThinkingStep["type"]) => {
    switch (type) {
      case "reasoning": return <Brain className="w-3 h-3" />;
      case "search": return <Sparkles className="w-3 h-3" />;
      case "tool": return <Sparkles className="w-3 h-3" />;
      case "analysis": return <Sparkles className="w-3 h-3" />;
      default: return <Sparkles className="w-3 h-3" />;
    }
  };

  return (
    <div className={cn("rounded-lg border border-amber-500/30 bg-amber-500/5 overflow-hidden", className)}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-3 py-2 hover:bg-amber-500/10 transition-colors"
      >
        <div className="flex items-center gap-2">
          {isThinking ? (
            <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />
          ) : (
            <Brain className="w-4 h-4 text-amber-500" />
          )}
          <span className="text-sm font-medium text-amber-500">
            {isThinking ? "Thinking..." : "Thought Process"}
          </span>
          {thinkingDuration && !isThinking && (
            <span className="flex items-center gap-1 text-xs text-amber-500/70">
              <Clock className="w-3 h-3" />
              {(thinkingDuration / 1000).toFixed(1)}s
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-amber-500/70" />
        ) : (
          <ChevronRight className="w-4 h-4 text-amber-500/70" />
        )}
      </button>

      {/* Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-2">
              {/* Steps */}
              {thinkingSteps.length > 0 && (
                <div className="space-y-1.5">
                  {thinkingSteps.map((step, idx) => (
                    <div
                      key={step.id || idx}
                      className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-300"
                    >
                      <span className="flex items-center justify-center w-4 h-4 rounded bg-amber-500/20 text-amber-500 flex-shrink-0 mt-0.5">
                        {getStepIcon(step.type)}
                      </span>
                      <span className="flex-1 leading-relaxed">{step.content}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Raw thinking content */}
              {thinkingContent && (
                <div className="mt-2 p-2 rounded bg-amber-500/10 text-xs text-amber-700 dark:text-amber-300 font-mono whitespace-pre-wrap max-h-48 overflow-auto">
                  {thinkingContent}
                </div>
              )}

              {/* Loading indicator */}
              {isThinking && thinkingSteps.length === 0 && !thinkingContent && (
                <div className="flex items-center gap-2 text-xs text-amber-500/70">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                  <span>Processing your request...</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
