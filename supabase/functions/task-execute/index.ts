import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Task types supported
type TaskType = "scrape" | "review" | "build" | "search" | "analyze";

interface TaskRequest {
  type: TaskType;
  payload: Record<string, unknown>;
  options?: {
    model?: string;
    timeout?: number;
  };
}

// Scrape a URL using Firecrawl
async function executeScrap(url: string): Promise<{ success: boolean; data?: unknown; error?: string }> {
  const apiKey = Deno.env.get("FIRECRAWL_API_KEY");
  if (!apiKey) {
    return { success: false, error: "Firecrawl not configured" };
  }

  let formattedUrl = url.trim();
  if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
    formattedUrl = `https://${formattedUrl}`;
  }

  try {
    const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: formattedUrl,
        formats: ["markdown", "links"],
        onlyMainContent: true,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return { success: false, error: data.error || "Scrape failed" };
    }

    return { success: true, data: data.data || data };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Unknown error" };
  }
}

// Analyze content with AI
async function analyzeWithAI(content: string, prompt: string, model?: string): Promise<{ success: boolean; result?: string; error?: string }> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) {
    return { success: false, error: "LOVABLE_API_KEY not configured" };
  }

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model || "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are Dive Coder V19.5, a senior developer assistant. Analyze the provided content and give detailed, actionable insights." },
          { role: "user", content: `${prompt}\n\nContent to analyze:\n${content}` },
        ],
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return { success: false, error: data.error?.message || "AI analysis failed" };
    }

    return { success: true, result: data.choices?.[0]?.message?.content || "" };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Unknown error" };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, payload, options } = await req.json() as TaskRequest;

    console.log(`Task execution started: ${type}`, payload);

    let result: { success: boolean; data?: unknown; error?: string };

    switch (type) {
      case "scrape": {
        const { url } = payload as { url: string };
        if (!url) {
          result = { success: false, error: "URL is required for scrape task" };
        } else {
          result = await executeScrap(url);
        }
        break;
      }

      case "analyze": {
        const { content, prompt } = payload as { content: string; prompt: string };
        if (!content) {
          result = { success: false, error: "Content is required for analyze task" };
        } else {
          const aiResult = await analyzeWithAI(content, prompt || "Analyze this content", options?.model);
          result = { success: aiResult.success, data: { analysis: aiResult.result }, error: aiResult.error };
        }
        break;
      }

      case "review": {
        const { code, language } = payload as { code: string; language?: string };
        if (!code) {
          result = { success: false, error: "Code is required for review task" };
        } else {
          const aiResult = await analyzeWithAI(
            code,
            `Review this ${language || "code"} for:
1. Security issues
2. Performance problems
3. Best practices violations
4. Potential bugs
5. Suggestions for improvement`,
            options?.model
          );
          result = { success: aiResult.success, data: { review: aiResult.result }, error: aiResult.error };
        }
        break;
      }

      case "search": {
        // URL + scrape + analyze combined
        const { url, query } = payload as { url: string; query?: string };
        if (!url) {
          result = { success: false, error: "URL is required for search task" };
        } else {
          const scrapeResult = await executeScrap(url);
          if (!scrapeResult.success) {
            result = scrapeResult;
          } else {
            const content = (scrapeResult.data as { markdown?: string })?.markdown || JSON.stringify(scrapeResult.data);
            const aiResult = await analyzeWithAI(
              content,
              query || "Summarize this content and extract key information",
              options?.model
            );
            result = {
              success: aiResult.success,
              data: {
                scraped: scrapeResult.data,
                analysis: aiResult.result,
              },
              error: aiResult.error,
            };
          }
        }
        break;
      }

      case "build": {
        // Build/generate code task
        const { description, framework } = payload as { description: string; framework?: string };
        if (!description) {
          result = { success: false, error: "Description is required for build task" };
        } else {
          const aiResult = await analyzeWithAI(
            description,
            `Generate production-ready ${framework || "React TypeScript"} code for the following requirements. Include:
1. Complete, runnable code
2. Proper error handling
3. TypeScript types
4. Comments for complex logic`,
            options?.model || "google/gemini-3-pro-preview" // Use Pro for code gen
          );
          result = { success: aiResult.success, data: { code: aiResult.result }, error: aiResult.error };
        }
        break;
      }

      default:
        result = { success: false, error: `Unknown task type: ${type}` };
    }

    console.log(`Task execution completed: ${type}`, result.success ? "success" : "failed");

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Task execution error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
