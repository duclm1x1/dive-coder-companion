import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center gap-3"
    >
      <div className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center bg-secondary/20 border border-secondary/30">
        <Sparkles className="w-4 h-4 text-secondary animate-pulse" />
      </div>
      <div className="flex gap-1.5 px-4 py-3 rounded-2xl bg-muted/50 border border-border">
        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
    </motion.div>
  );
}
