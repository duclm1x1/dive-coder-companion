import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Model mapping from our UI names to Lovable AI gateway names
const MODEL_MAPPING: Record<string, string> = {
  "gemini-3-flash": "google/gemini-3-flash-preview",
  "gemini-3-pro": "google/gemini-3-pro-preview",
  "gemini-2.5-pro": "google/gemini-2.5-pro",
  "gemini-2.5-flash": "google/gemini-2.5-flash",
  "gpt-5": "openai/gpt-5",
  "gpt-5-mini": "openai/gpt-5-mini",
  "gpt-5.2": "openai/gpt-5.2",
  "claude-sonnet": "google/gemini-3-pro-preview", // Fallback
  "claude-opus": "openai/gpt-5", // Fallback
};

const SYSTEM_PROMPT = `You are Dive Coder V19.5 Enhanced Edition, an advanced AI coding assistant powered by Dive Engine V2 with Dual Thinking capabilities.

You have access to 159+ skills including:
- Enterprise RAG (offline-first retrieval)
- CPCG (Code Pattern Generator)
- SHC (Self-Healing Code)
- Dual Thinking (Fast + Deep reasoning tracks)

You help developers with:
- Code reviews and best practices
- Debugging and error explanations
- Test generation
- Code refactoring
- Architecture design
- Documentation

Always provide clear, concise, and helpful responses. Use markdown formatting for code blocks and explanations.`;

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { messages, model } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Map model ID to Lovable AI gateway model
    const gatewayModel = MODEL_MAPPING[model] || "google/gemini-3-flash-preview";
    
    console.log(`Chat request - Model: ${model} -> ${gatewayModel}, Messages: ${messages.length}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: gatewayModel,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error("Rate limit exceeded");
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        console.error("Payment required");
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: `AI service error: ${response.status}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Streaming response started");
    
    // Return the streaming response
    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat function error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
