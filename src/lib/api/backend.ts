// Backend API client for Dive AI V20
// Connects to tRPC backend with Socket.IO real-time

import { supabase } from "@/integrations/supabase/client";

// tRPC API URL
const API_URL = 'https://3000-iym918g1udg3z0fllnp0o-5536f345.us2.manus.computer/api/trpc';

export interface SystemStatus {
  connected: boolean;
  components: {
    diveOrchestrator: boolean;
    masterOrchestrator: boolean;
    multiModelReview: boolean;
    diveCoder: boolean;
  };
  agentCount: number;
  models: number;
}

export interface DashboardStats {
  totalRuns: number;
  successRate: number;
  totalCost: number;
  activeProvider: string;
}

export interface Agent {
  id: number;
  status: 'idle' | 'busy' | 'error';
  capabilities: number;
  currentTask: string | null;
  progress: number;
  lastActive: Date;
}

export interface Model {
  id: string;
  name: string;
  provider: string;
  status: 'available' | 'unavailable';
  pricing: { input: number; output: number };
  specialization: string[];
  score: number;
  usage: { tasks: number; cost: number };
}

export interface ActivityItem {
  type: string;
  userId: string;
  timestamp: Date;
  [key: string]: unknown;
}

export type TaskType = "scrape" | "review" | "build" | "search" | "analyze" | "code_generation" | "code_review";

export interface ExecuteTaskInput {
  type: TaskType;
  payload: Record<string, unknown>;
  options?: {
    model?: string;
    timeout?: number;
    agentCount?: number;
  };
}

export interface TaskResult<T = unknown> {
  success: boolean;
  data?: T & {
    output?: string;
    confidence?: number;
    cost?: number;
    executionTime?: number;
    agentsUsed?: number;
    thinking?: string[];
  };
  error?: string;
}

export interface ScrapeResult {
  markdown?: string;
  html?: string;
  links?: string[];
  metadata?: {
    title?: string;
    description?: string;
    sourceURL?: string;
  };
}

export interface AnalysisResult {
  analysis: string;
}

export interface ReviewResult {
  review: string;
}

export interface BuildResult {
  code: string;
}

export interface SearchResult {
  scraped: ScrapeResult;
  analysis: string;
}

// tRPC helper - makes batch requests to tRPC endpoint
async function trpcQuery<T>(procedure: string, input?: unknown): Promise<T> {
  const url = new URL(API_URL);
  url.pathname += `/${procedure}`;
  
  if (input !== undefined) {
    url.searchParams.set('input', JSON.stringify({ "0": input }));
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`tRPC query failed: ${response.status}`);
  }

  const data = await response.json();
  return data[0]?.result?.data as T;
}

async function trpcMutation<T>(procedure: string, input: unknown): Promise<T> {
  const response = await fetch(`${API_URL}/${procedure}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ "0": input }),
  });

  if (!response.ok) {
    throw new Error(`tRPC mutation failed: ${response.status}`);
  }

  const data = await response.json();
  return data[0]?.result?.data as T;
}

// API client object - combines tRPC and legacy Supabase methods
export const backendApi = {
  // ===== NEW tRPC METHODS (Dive AI V20) =====
  
  // Get system status
  async getStatus(): Promise<SystemStatus> {
    try {
      return await trpcQuery<SystemStatus>('uiBridge.getStatus');
    } catch (error) {
      console.error('[tRPC] getStatus failed:', error);
      return {
        connected: false,
        components: {
          diveOrchestrator: false,
          masterOrchestrator: false,
          multiModelReview: false,
          diveCoder: false,
        },
        agentCount: 0,
        models: 0,
      };
    }
  },

  // Get dashboard stats
  async getStats(): Promise<DashboardStats> {
    try {
      return await trpcQuery<DashboardStats>('uiBridge.getStats');
    } catch (error) {
      console.error('[tRPC] getStats failed:', error);
      return {
        totalRuns: 0,
        successRate: 0,
        totalCost: 0,
        activeProvider: 'None',
      };
    }
  },

  // Get agents
  async getAgents(): Promise<Agent[]> {
    try {
      return await trpcQuery<Agent[]>('uiBridge.getAgents');
    } catch (error) {
      console.error('[tRPC] getAgents failed:', error);
      return [];
    }
  },

  // Get models
  async getModels(): Promise<Model[]> {
    try {
      return await trpcQuery<Model[]>('uiBridge.getModels');
    } catch (error) {
      console.error('[tRPC] getModels failed:', error);
      return [];
    }
  },

  // Get activity
  async getActivity(limit?: number): Promise<ActivityItem[]> {
    try {
      return await trpcQuery<ActivityItem[]>('uiBridge.getActivity', { limit });
    } catch (error) {
      console.error('[tRPC] getActivity failed:', error);
      return [];
    }
  },

  // ===== LEGACY SUPABASE METHODS (kept for compatibility) =====

  // Execute any task type (supports both tRPC and Supabase)
  async executeTask<T = unknown>(
    type: TaskType,
    payload: Record<string, unknown>,
    options?: { model?: string; timeout?: number; agentCount?: number }
  ): Promise<TaskResult<T>> {
    // Try tRPC first (Dive AI V20)
    try {
      const result = await trpcMutation<TaskResult<T>>('uiBridge.executeTask', {
        type,
        payload,
        options,
      });
      return result;
    } catch (trpcError) {
      console.warn('[tRPC] executeTask failed, falling back to Supabase:', trpcError);
      
      // Fallback to Supabase edge function
      const { data, error } = await supabase.functions.invoke("task-execute", {
        body: { type, payload, options },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return data;
    }
  },

  // Scrape a URL (Supabase)
  async scrape(url: string, options?: { formats?: string[] }): Promise<TaskResult<ScrapeResult>> {
    const { data, error } = await supabase.functions.invoke("firecrawl-scrape", {
      body: { url, options },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    const result = data?.data || data;
    return { success: data?.success !== false, data: result, error: data?.error };
  },

  // Analyze content with AI
  async analyze(content: string, prompt?: string, model?: string): Promise<TaskResult<AnalysisResult>> {
    const result = await this.executeTask("analyze", { content, prompt }, { model });
    return result as TaskResult<AnalysisResult>;
  },

  // Review code
  async reviewCode(code: string, language?: string, model?: string): Promise<TaskResult<ReviewResult>> {
    const result = await this.executeTask("review", { code, language }, { model });
    return result as TaskResult<ReviewResult>;
  },

  // Build/generate code
  async build(description: string, framework?: string, model?: string): Promise<TaskResult<BuildResult>> {
    const result = await this.executeTask("build", { description, framework }, { model });
    return result as TaskResult<BuildResult>;
  },

  // Search (scrape + analyze)
  async search(url: string, query?: string, model?: string): Promise<TaskResult<SearchResult>> {
    const result = await this.executeTask("search", { url, query }, { model });
    return result as TaskResult<SearchResult>;
  },

  // Stream chat message (Supabase)
  async streamChat(params: {
    messages: Array<{ role: "user" | "assistant"; content: string }>;
    model?: string;
    onDelta: (chunk: string) => void;
    onDone: () => void;
    onError?: (error: string) => void;
    signal?: AbortSignal;
  }): Promise<void> {
    const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

    try {
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: params.messages,
          model: params.model || "gemini-3-flash",
        }),
        signal: params.signal,
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("Rate limit exceeded. Please try again later.");
        }
        if (response.status === 402) {
          throw new Error("AI credits exhausted. Please add credits to continue.");
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Request failed: ${response.status}`);
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            params.onDone();
            return;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              params.onDelta(content);
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      params.onDone();
    } catch (error) {
      if ((error as Error).name === "AbortError") return;
      const message = error instanceof Error ? error.message : "Unknown error";
      params.onError?.(message);
    }
  },
};

// Check if a message contains a URL to process
export function extractUrls(text: string): string[] {
  const urlRegex = /https?:\/\/[^\s<>"{}|\\^`[\]]+/gi;
  return text.match(urlRegex) || [];
}

// Check if message is a command
export function isCommand(text: string): boolean {
  return text.trim().startsWith("/");
}

// Parse command from message
export function parseCommand(text: string): { command: string; args: string } | null {
  const match = text.trim().match(/^\/(\S+)\s*(.*)/);
  if (!match) return null;
  return { command: match[1], args: match[2] };
}
