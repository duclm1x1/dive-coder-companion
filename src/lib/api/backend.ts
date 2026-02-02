// Backend API client for Dive Coder V19.5
// Connects to Supabase Edge Functions

import { supabase } from "@/integrations/supabase/client";

export type TaskType = "scrape" | "review" | "build" | "search" | "analyze";

export interface TaskResult<T = unknown> {
  success: boolean;
  data?: T;
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

// API client object
export const backendApi = {
  // Execute any task type
  async executeTask<T = unknown>(
    type: TaskType,
    payload: Record<string, unknown>,
    options?: { model?: string; timeout?: number }
  ): Promise<TaskResult<T>> {
    const { data, error } = await supabase.functions.invoke("task-execute", {
      body: { type, payload, options },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return data;
  },

  // Scrape a URL
  async scrape(url: string, options?: { formats?: string[] }): Promise<TaskResult<ScrapeResult>> {
    const { data, error } = await supabase.functions.invoke("firecrawl-scrape", {
      body: { url, options },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    // Handle nested data structure
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

  // Stream chat message
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
            // Incomplete JSON, put back
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
