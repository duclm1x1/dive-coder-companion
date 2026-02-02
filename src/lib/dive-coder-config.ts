// Dive Coder V19.5 Enhanced Edition - Configuration
// Based on https://github.com/duclm1x1/Dive-Coder

export const DIVE_CODER_VERSION = "V19.5";
export const DIVE_CODER_EDITION = "Enhanced Edition";
export const DIVE_CODER_RELEASE_DATE = "February 2, 2026";
export const DIVE_CODER_STATUS = "Production Ready";

// Model tiers
export type ModelTier = "fast" | "pro" | "reasoning";

export interface ModelConfig {
  id: string;
  name: string;
  provider: string;
  tier: ModelTier;
  supportsThinking?: boolean;
}

// Available models via AICoding.dev
export const MODELS: ModelConfig[] = [
  { id: "google/gemini-3-flash-preview", name: "Gemini 3 Flash", provider: "Google", tier: "fast" },
  { id: "google/gemini-3-pro-preview", name: "Gemini 3 Pro", provider: "Google", tier: "pro" },
  { id: "google/gemini-2.5-flash", name: "Gemini 2.5 Flash", provider: "Google", tier: "fast" },
  { id: "google/gemini-2.5-pro", name: "Gemini 2.5 Pro", provider: "Google", tier: "pro" },
  { id: "openai/gpt-5", name: "GPT-5", provider: "OpenAI", tier: "pro", supportsThinking: true },
  { id: "openai/gpt-5.2", name: "GPT-5.2 (Thinking)", provider: "OpenAI", tier: "reasoning", supportsThinking: true },
  { id: "anthropic/claude-sonnet-4.5", name: "Claude Sonnet 4.5", provider: "Anthropic", tier: "pro" },
  { id: "anthropic/claude-opus-4", name: "Claude Opus 4", provider: "Anthropic", tier: "reasoning", supportsThinking: true },
];

export interface ChatSettings {
  model: string;
  showThinking: boolean;
}

export const DEFAULT_CHAT_SETTINGS: ChatSettings = {
  model: "google/gemini-3-flash-preview",
  showThinking: true,
};

// V19.5 Statistics
export const DIVE_STATS = {
  totalFiles: 3632,
  totalSize: "60 MB",
  skills: 159,
  docFiles: 10,
  testSuites: 7,
  configDirs: 2,
};

// Example prompts for welcome screen
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

// Slash Commands (from V19.5)
export const SLASH_COMMANDS = [
  { command: "/vibe-status", description: "Check Vibe Coder status", category: "status" },
  { command: "/vibe-review", description: "Run code review on repo", category: "review" },
  { command: "/vibe-pr", description: "Review PR/diff changes", category: "review" },
  { command: "/vibe-baseline", description: "Manage baseline comparisons", category: "ci" },
  { command: "/vibe-sarif", description: "Generate SARIF report", category: "report" },
  { command: "/vibe-autopatch", description: "Auto-patch issues", category: "fix" },
  { command: "/vibe-golden", description: "Golden test management", category: "test" },
  { command: "/vibe-docs", description: "Generate documentation", category: "docs" },
  { command: "/vibe-skills", description: "List available skills (159+)", category: "skills" },
  { command: "/vibe-build", description: "Project Builder", category: "build" },
  { command: "/vibe-resolve", description: "Verification loop + patch", category: "fix" },
  { command: "/vibe-search", description: "Advanced search (hybrid)", category: "search" },
  { command: "/vibe-rag", description: "RAG offline-first retrieval", category: "rag" },
  { command: "/vibe-init", description: "Initialize templates", category: "setup" },
  { command: "/vibe-preflight", description: "Validate spec", category: "validate" },
  { command: "/vibe-self-review", description: "Check repo readiness", category: "validate" },
];

// V19.5 Core Features
export const DIVE_FEATURES = [
  { 
    id: "rag",
    icon: "Database", 
    label: "Enterprise RAG", 
    description: "Offline-first retrieval with v13-rag", 
    color: "text-cyan-400",
    enabled: true
  },
  { 
    id: "cpcg",
    icon: "Cpu", 
    label: "CPCG", 
    description: "Code Pattern Generator (159+ skills)", 
    color: "text-purple-400",
    enabled: true
  },
  { 
    id: "shc",
    icon: "Shield", 
    label: "SHC", 
    description: "Self-Healing Code + autopatch", 
    color: "text-green-400",
    enabled: true
  },
  { 
    id: "dual-think",
    icon: "Brain", 
    label: "Dual Thinking", 
    description: "Fast + Deep reasoning tracks", 
    color: "text-amber-400",
    enabled: true
  },
  { 
    id: "slash",
    icon: "Command", 
    label: "Slash Commands", 
    description: "16+ workflow commands", 
    color: "text-pink-400",
    enabled: true
  },
  { 
    id: "multi-model",
    icon: "Sparkles", 
    label: "Multi-Model", 
    description: "Gemini 3 + GPT-5 + Claude", 
    color: "text-blue-400",
    enabled: true
  },
];

// V19.5 Component Status
export const COMPONENT_STATUS = {
  core: [
    { name: "antigravity_plugin", files: 7, status: "stable" },
    { name: "clawdbot_plugin", files: 4, status: "stable" },
    { name: "coder", files: 2, status: "stable" },
    { name: "dive-context", files: 75, status: "stable" },
    { name: "examples", files: 6, status: "stable" },
    { name: "monitor_server", files: 5, status: "stable" },
    { name: "orchestrator", files: 2, status: "stable" },
    { name: "replication", files: 2, status: "stable" },
    { name: "ui", files: 104, status: "stable" },
  ],
  enhanced: [
    { name: "docs", from: 0, to: 10, source: "V15.3" },
    { name: "skills", from: 142, to: 159, source: "V19 Enhanced" },
    { name: "tests", from: 10, to: 16, source: "V19 Enhanced" },
    { name: "configs", enhancement: "tokens from V14" },
  ],
};

// New Skills in V19.5
export const NEW_SKILLS_V19_5 = [
  "base-skill-connection",
  "ccf (Custom Code Framework)",
  "cpcg (Code Pattern Generator)",
  "dac (Dynamic Architecture Component)",
  "drc (Data Replication Component)",
  "eda (Event-Driven Architecture)",
  "egfv (Enhanced GUI Framework)",
  "excel-generator",
  "mvp (Minimum Viable Product)",
  "ptd (Protocol Template Definition)",
  "scw (Skill Configuration Wizard)",
  "shc (Skill Helper Component)",
  "skill-creator",
  "Development roadmap phases",
];
