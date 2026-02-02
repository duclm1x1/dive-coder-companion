import { Code2, Database, Cpu, Shield, Brain, Command, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DIVE_CODER_VERSION, DIVE_CODER_EDITION, EXAMPLE_PROMPTS, DIVE_FEATURES } from "@/lib/dive-coder-config";
import { cn } from "@/lib/utils";

interface WelcomeScreenProps {
  onNewChat: () => void;
  onPromptClick: (prompt: string) => void;
}

const iconMap: Record<string, typeof Database> = {
  Database, Cpu, Shield, Brain, Command, Sparkles
};

export function WelcomeScreen({ onNewChat, onPromptClick }: WelcomeScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-4 py-8 animate-fade-in overflow-y-auto">
      {/* Logo */}
      <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 border border-primary/30 mb-6 glow-primary">
        <Code2 className="w-10 h-10 text-primary" />
      </div>

      {/* Title */}
      <h1 className="text-4xl font-bold mb-1 gradient-text text-glow">
        Dive Coder {DIVE_CODER_VERSION}
      </h1>
      <p className="text-sm text-muted-foreground mb-2">{DIVE_CODER_EDITION}</p>
      <p className="text-muted-foreground text-center max-w-lg mb-8">
        Advanced AI coding assistant powered by Dive Engine V2 with Dual Thinking Model.
        Select a model and start coding.
      </p>

      {/* Features Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8 max-w-2xl w-full">
        {DIVE_FEATURES.map((feature, index) => {
          const Icon = iconMap[feature.icon] || Sparkles;
          return (
            <div
              key={index}
              className="glass-card p-4 flex items-center gap-3 hover:scale-[1.02] transition-transform"
            >
              <div className={cn("p-2 rounded-lg bg-muted/50", feature.color)}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{feature.label}</p>
                <p className="text-2xs text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Start Chat Button */}
      <Button
        onClick={onNewChat}
        size="lg"
        className="mb-8 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow"
      >
        <Sparkles className="w-4 h-4" />
        Start New Chat
      </Button>

      {/* Example Prompts */}
      <div className="w-full max-w-2xl">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3 text-center">
          Try these prompts
        </p>
        <div className="grid grid-cols-2 gap-2">
          {EXAMPLE_PROMPTS.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                onNewChat();
                setTimeout(() => onPromptClick(item.prompt), 100);
              }}
              className="p-3 text-left rounded-lg bg-muted/50 border border-border hover:border-primary/30 hover:bg-muted transition-all"
            >
              <p className="text-sm font-medium text-foreground">{item.title}</p>
              <p className="text-xs text-muted-foreground truncate">{item.prompt}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
