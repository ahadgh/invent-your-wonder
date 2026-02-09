import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { inputText } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are a structured data extractor. Analyze the following text and convert it to structured JSON.
Detect if it is a "workout" or "meal" plan.

Rules for MEAL:
- "dayName" should be the meal time like "صبحانه", "ناهار", "شام", "میان وعده".
- "name" should be the option label like "گزینه ۱".
- "sets" should be the main food description.
- "reps" and "rest" should be EMPTY or '-' unless specifically different instructions exist.

Rules for WORKOUT:
- "dayName" should be day labels like "روز اول - سینه و جلوبازو".
- "name" should be exercise name.
- "sets" should be number of sets.
- "reps" should be number of reps.
- "rest" should be rest time.

If there's a student name, extract it. If there's a weight, extract it.
If there are golden tips or notes, put them in "tips" field.

IMPORTANT: You MUST respond using the suggest_workout_data tool.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: inputText }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "suggest_workout_data",
              description: "Return structured workout or meal plan data",
              parameters: {
                type: "object",
                properties: {
                  type: { type: "string", enum: ["workout", "meal"] },
                  studentName: { type: "string" },
                  studentWeight: { type: "string" },
                  tips: { type: "string" },
                  days: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        dayName: { type: "string" },
                        exercises: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              name: { type: "string" },
                              sets: { type: "string" },
                              reps: { type: "string" },
                              rest: { type: "string" }
                            },
                            required: ["name", "sets", "reps", "rest"],
                            additionalProperties: false
                          }
                        }
                      },
                      required: ["dayName", "exercises"],
                      additionalProperties: false
                    }
                  }
                },
                required: ["type", "days"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "suggest_workout_data" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "محدودیت درخواست. لطفاً کمی صبر کنید." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "اعتبار کافی نیست." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "خطا در سرویس هوش مصنوعی" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await response.json();
    
    // Extract tool call result
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(parsed), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fallback: try to parse content directly
    const content = result.choices?.[0]?.message?.content;
    if (content) {
      const parsed = JSON.parse(content);
      return new Response(JSON.stringify(parsed), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "پاسخ نامعتبر از هوش مصنوعی" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("parse-workout error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "خطای ناشناخته" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
