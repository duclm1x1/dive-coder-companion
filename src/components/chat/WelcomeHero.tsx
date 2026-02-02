import { Brain, Code, TestTube, Sparkles, AlertTriangle, MessageSquare, Command } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  DIVE_CODER_VERSION, 
  DIVE_CODER_EDITION, 
  DIVE_CODER_STATUS,
  DIVE_STATS,
  EXAMPLE_PROMPTS,
  SLASH_COMMANDS
} from "@/lib/dive-coder-config";
import { useState } from "react";

interface WelcomeHeroProps {
  onSelectPrompt: (prompt: string) => void;
}

const iconMap: Record<string, React.ReactNode> = {
  Code: <Code className="w-5 h-5" />,
  AlertTriangle: <AlertTriangle className="w-5 h-5" />,
  TestTube: <TestTube className="w-5 h-5" />,
  Sparkles: <Sparkles className="w-5 h-5" />,
};

export function WelcomeHero({ onSelectPrompt }: WelcomeHeroProps) {
  const [showCommands, setShowCommands] = useState(false);

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 animate-fade-in">
      {/* Logo & Branding */}
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary via-primary/80 to-secondary flex items-center justify-center shadow-glow">
          <Brain className="w-10 h-10 text-primary-foreground" />
        </div>
        <div className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
          {DIVE_CODER_VERSION}
        </div>
      </div>
      
      {/* Title */}
      <h1 className="text-2xl font-bold gradient-text mb-2">
        Dive Coder
      </h1>
      <p className="text-sm text-muted-foreground mb-1">
        {DIVE_CODER_EDITION} • {DIVE_CODER_STATUS}
      </p>
      
      {/* Stats Badge */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
          {DIVE_STATS.skills}+ Skills
        </span>
        <span className="text-xs px-2 py-1 rounded-full bg-secondary/10 text-secondary font-medium">
          {DIVE_STATS.testSuites} Test Suites
        </span>
        <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground font-medium">
          {DIVE_STATS.totalFiles} Files
        </span>
      </div>

      <p className="text-muted-foreground text-center max-w-md text-sm mb-8">
        AI-powered coding assistant with Enterprise RAG, CPCG, SHC, and Dual Thinking.
      </p>

      {/* Quick Prompts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl mb-6">
        {EXAMPLE_PROMPTS.map((item, i) => (
          <button
            key={i}
            onClick={() => onSelectPrompt(item.prompt)}
            className={cn(
              "group flex items-start gap-3 p-4 rounded-xl",
              "bg-card/50 border border-border hover:border-primary/50",
              "hover:bg-primary/5 transition-all duration-200",
              "text-left"
            )}
          >
            <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              {iconMap[item.icon] || <MessageSquare className="w-5 h-5" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-foreground mb-0.5">
                {item.title}
              </p>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {item.prompt}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Slash Commands Toggle */}
      <button
        onClick={() => setShowCommands(!showCommands)}
        className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors mb-4"
      >
        <Command className="w-3.5 h-3.5" />
        <span>{showCommands ? "Hide" : "Show"} {SLASH_COMMANDS.length} slash commands</span>
      </button>

      {/* Slash Commands Grid */}
      {showCommands && (
        <div className="w-full max-w-2xl grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6 animate-fade-in">
          {SLASH_COMMANDS.slice(0, 8).map((cmd) => (
            <button
              key={cmd.command}
              onClick={() => onSelectPrompt(cmd.command)}
              className="text-left p-2 rounded-lg bg-muted/50 hover:bg-primary/10 border border-transparent hover:border-primary/30 transition-all"
            >
              <p className="text-xs font-mono text-primary">{cmd.command}</p>
              <p className="text-[10px] text-muted-foreground truncate">{cmd.description}</p>
            </button>
          ))}
        </div>
      )}

      {/* Keyboard shortcut hint */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <kbd className="px-2 py-1 rounded bg-muted border border-border font-mono">⌘</kbd>
        <span>+</span>
        <kbd className="px-2 py-1 rounded bg-muted border border-border font-mono">Enter</kbd>
        <span>to send</span>
        <span className="mx-2 text-border">•</span>
        <kbd className="px-2 py-1 rounded bg-muted border border-border font-mono">/</kbd>
        <span>for commands</span>
      </div>
    </div>
  );
}
