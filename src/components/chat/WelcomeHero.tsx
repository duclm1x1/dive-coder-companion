import { Brain, Code, TestTube, Sparkles, AlertTriangle, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { DIVE_CODER_VERSION, DIVE_CODER_EDITION, EXAMPLE_PROMPTS } from "@/lib/dive-coder-config";

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
        {DIVE_CODER_EDITION}
      </p>
      <p className="text-muted-foreground text-center max-w-md text-sm mb-8">
        Your AI-powered coding assistant. Ask me anything about coding, debugging, or building your project.
      </p>

      {/* Quick Prompts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
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

      {/* Keyboard shortcut hint */}
      <div className="mt-8 flex items-center gap-2 text-xs text-muted-foreground">
        <kbd className="px-2 py-1 rounded bg-muted border border-border font-mono">⌘</kbd>
        <span>+</span>
        <kbd className="px-2 py-1 rounded bg-muted border border-border font-mono">Enter</kbd>
        <span>to send message</span>
      </div>
    </div>
  );
}
