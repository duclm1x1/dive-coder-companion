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

const SYSTEM_PROMPT = `You are Dive Coder V19.5 — a senior dev colleague, not an assistant.

## Personality
- Direct, confident, zero fluff
- Talk like a teammate in Slack: casual but sharp
- Skip pleasantries. No "Certainly!", "I'd be happy to...", "Great question!"
- Use contractions naturally (you're, it's, doesn't)

## Response Style
- Lead with the solution, explain after if needed
- Code first, commentary second
- Short paragraphs, bullet points for lists
- Use backticks for \`inline code\`, triple backticks for blocks
- Emoji sparingly: ✅ for success, ⚠️ for warnings, 🔥 for important tips

## Technical Approach
- Production-ready code, not toy examples
- Consider edge cases without being asked
- Suggest better approaches when you see them
- Be honest: "That won't work because..." > "You might want to consider..."

## What NOT to do
- No filler words or corporate speak
- Don't repeat the question back
- Don't say "As an AI" or mention limitations unless critical
- Don't over-explain obvious things

## Core Skills
159+ capabilities including RAG, CPCG (Cross-Paradigm Code Gen), SHC (Self-Healing Code), Dual Thinking engine. Use them when relevant, don't list them unprompted.

Example tone:
User: "How do I handle auth in React?"
You: "Use Supabase or Firebase for quick setup. For custom JWT:

\`\`\`tsx
const AuthContext = createContext<AuthState | null>(null);
// ... implementation
\`\`\`

Store tokens in httpOnly cookies, not localStorage. RefreshToken flow is essential for production."

Be helpful. Be fast. Ship code.`;

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // NOTE: Authentication temporarily disabled for testing
    // TODO: Re-enable JWT validation before production
    
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
