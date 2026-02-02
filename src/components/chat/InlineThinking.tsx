import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Search, Zap, PenLine, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThinkingStep {
  id: string;
  text: string;
  status: "active" | "complete" | "pending";
}

interface InlineThinkingProps {
  currentStep: string;
  steps?: string[];
  isGenerating?: boolean;
  className?: string;
}

const getStepIcon = (step: string) => {
  if (step.toLowerCase().includes("understanding") || step.toLowerCase().includes("analyzing")) {
    return <Search className="w-3.5 h-3.5" />;
  }
  if (step.toLowerCase().includes("connecting") || step.toLowerCase().includes("processing")) {
    return <Zap className="w-3.5 h-3.5" />;
  }
  if (step.toLowerCase().includes("generating") || step.toLowerCase().includes("writing")) {
    return <PenLine className="w-3.5 h-3.5" />;
  }
  return <Sparkles className="w-3.5 h-3.5" />;
};

export function InlineThinking({ currentStep, steps = [], isGenerating, className }: InlineThinkingProps) {
  const [displayStep, setDisplayStep] = useState(currentStep);

  useEffect(() => {
    setDisplayStep(currentStep);
  }, [currentStep]);

  if (!currentStep && !isGenerating) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn("flex items-start gap-3", className)}
    >
      {/* Animated orb */}
      <div className="relative flex-shrink-0">
        <motion.div
          className="w-8 h-8 rounded-full bg-gradient-to-br from-primary via-primary/80 to-primary/60 flex items-center justify-center shadow-lg"
          animate={{
            scale: [1, 1.05, 1],
            boxShadow: [
              "0 0 0 0 rgba(var(--primary), 0)",
              "0 0 20px 4px rgba(var(--primary), 0.3)",
              "0 0 0 0 rgba(var(--primary), 0)"
            ]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Sparkles className="w-4 h-4 text-primary-foreground" />
        </motion.div>
        
        {/* Ripple effect */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-primary/30"
          animate={{
            scale: [1, 1.8],
            opacity: [0.6, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeOut"
          }}
        />
      </div>

      {/* Status content */}
      <div className="flex-1 pt-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={displayStep}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2"
          >
            {/* Current step indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
              <motion.span
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="text-primary"
              >
                {getStepIcon(displayStep)}
              </motion.span>
              <span className="text-sm font-medium text-primary">
                {displayStep}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Completed steps (subtle) */}
        {steps.length > 1 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-2 flex flex-wrap gap-1.5"
          >
            {steps.slice(0, -1).map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center gap-1 text-xs text-muted-foreground/60"
              >
                <CheckCircle2 className="w-3 h-3 text-green-500/60" />
                <span>{step.replace("...", "")}</span>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Typing dots for generating state */}
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3 flex items-center gap-1"
          >
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="w-2 h-2 rounded-full bg-primary/60"
                animate={{
                  y: [0, -6, 0],
                  opacity: [0.4, 1, 0.4],
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: "easeInOut",
                }}
              />
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// Simpler version for inline use
export function ThinkingDots() {
  return (
    <span className="inline-flex items-center gap-0.5 ml-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-current"
          animate={{
            y: [0, -3, 0],
            opacity: [0.3, 1, 0.3],
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            delay: i * 0.1,
            ease: "easeInOut",
          }}
        />
      ))}
    </span>
  );
}
