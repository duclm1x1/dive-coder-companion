// Dive Coder V19.5 Configuration

export const DIVE_CODER_VERSION = "V19.5";
export const DIVE_CODER_EDITION = "Enhanced Edition";

// Model tiers
export type ModelTier = "fast" | "pro" | "reasoning";

export interface ModelConfig {
  id: string;
  name: string;
  provider: string;
  tier: ModelTier;
  supportsThinking?: boolean;
}

// Available models via Lovable AI
export const MODELS: ModelConfig[] = [
  { id: "google/gemini-3-flash-preview", name: "Gemini 3 Flash", provider: "Google", tier: "fast" },
  { id: "google/gemini-3-pro-preview", name: "Gemini 3 Pro", provider: "Google", tier: "pro" },
  { id: "google/gemini-2.5-flash", name: "Gemini 2.5 Flash", provider: "Google", tier: "fast" },
  { id: "openai/gpt-5", name: "GPT-5", provider: "OpenAI", tier: "pro", supportsThinking: true },
  { id: "openai/gpt-5.2", name: "GPT-5.2 (Thinking)", provider: "OpenAI", tier: "reasoning", supportsThinking: true },
];

export interface ChatSettings {
  model: string;
  showThinking: boolean;
}

export const DEFAULT_CHAT_SETTINGS: ChatSettings = {
  model: "google/gemini-3-flash-preview",
  showThinking: true,
};

export const EXAMPLE_PROMPTS = [
  {
    title: "Review my code",
    prompt: "Review this code for best practices, security issues, and potential improvements.",
    icon: "Code"
  },
  {
    title: "Explain this error",
    prompt: "I'm getting this error. Can you explain what's wrong and how to fix it?",
    icon: "AlertTriangle"
  },
  {
    title: "Generate tests",
    prompt: "Write comprehensive unit tests for this function with edge cases.",
    icon: "TestTube"
  },
  {
    title: "Refactor code",
    prompt: "Refactor this code to be more readable and maintainable.",
    icon: "Sparkles"
  }
];

export const DIVE_FEATURES = [
  { icon: "Database", label: "Enterprise RAG", description: "Offline-first retrieval", color: "text-cyan-400" },
  { icon: "Cpu", label: "CPCG", description: "159+ code skills", color: "text-purple-400" },
  { icon: "Shield", label: "SHC", description: "Self-healing code", color: "text-green-400" },
  { icon: "Brain", label: "Dual Thinking", description: "Fast + Deep tracks", color: "text-amber-400" },
  { icon: "Command", label: "Slash Commands", description: "16+ workflows", color: "text-pink-400" },
  { icon: "Sparkles", label: "Multi-Model", description: "Gemini 3 + GPT-5", color: "text-blue-400" },
];
