import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ANALYSIS_SCHEMA = {
  name: "analyze_profile",
  description: "Analyze resume vs job description, extract skills, identify gaps, and generate a learning roadmap",
  parameters: {
    type: "object",
    properties: {
      resumeSkills: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            level: { type: "string", enum: ["beginner", "intermediate", "advanced"] },
            source: { type: "string", enum: ["resume", "job_description", "both"] },
          },
          required: ["name", "level", "source"],
        },
      },
      jobSkills: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            level: { type: "string", enum: ["beginner", "intermediate", "advanced"] },
            source: { type: "string", enum: ["resume", "job_description", "both"] },
          },
          required: ["name", "level", "source"],
        },
      },
      skillGaps: {
        type: "array",
        items: {
          type: "object",
          properties: {
            skill: { type: "string" },
            status: { type: "string", enum: ["missing", "weak", "strong"] },
            currentLevel: { type: "string" },
            requiredLevel: { type: "string" },
            priority: { type: "string", enum: ["critical", "high", "medium", "low"] },
          },
          required: ["skill", "status", "currentLevel", "requiredLevel", "priority"],
        },
      },
      roadmap: {
        type: "array",
        items: {
          type: "object",
          properties: {
            step: { type: "number" },
            title: { type: "string" },
            description: { type: "string" },
            skills: { type: "array", items: { type: "string" } },
            estimatedHours: { type: "number" },
            dependencies: { type: "array", items: { type: "string" } },
            resources: { type: "array", items: { type: "string" } },
          },
          required: ["step", "title", "description", "skills", "estimatedHours", "dependencies", "resources"],
        },
      },
      reasoning: {
        type: "array",
        items: {
          type: "object",
          properties: {
            observation: { type: "string" },
            reasoning: { type: "string" },
            action: { type: "string" },
          },
          required: ["observation", "reasoning", "action"],
        },
      },
      matchScore: { type: "number", description: "Percentage 0-100 of how well the resume matches the job" },
      estimatedTotalHours: { type: "number", description: "Total estimated hours to complete the roadmap" },
    },
    required: ["resumeSkills", "jobSkills", "skillGaps", "roadmap", "reasoning", "matchScore", "estimatedTotalHours"],
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resumeBase64, resumeFileName, jobDescription } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let resumeContent = "";
    if (resumeBase64) {
      // Decode base64 PDF to extract text (simple approach - send as context)
      const bytes = Uint8Array.from(atob(resumeBase64), c => c.charCodeAt(0));
      // Extract readable text from PDF bytes
      const textDecoder = new TextDecoder("utf-8", { fatal: false });
      const rawText = textDecoder.decode(bytes);
      // Filter printable text segments
      resumeContent = rawText
        .replace(/[^\x20-\x7E\n\r\t]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 8000);
    }

    const systemPrompt = `You are an expert HR-tech analyst and career advisor. Analyze the provided resume and job description to:

1. Extract skills from both the resume and job description with proficiency levels
2. Identify skill gaps (missing, weak, or strong match)
3. Generate a dependency-aware learning roadmap that:
   - Starts from current skill level
   - Fills missing prerequisites first (e.g., JavaScript before React before Next.js)
   - Avoids redundant topics
   - Prioritizes weakest and most critical skills
4. Provide step-by-step reasoning trace showing your decision logic

Be specific and practical. Use real skill names, realistic hour estimates, and concrete resource suggestions.
Only output skills that are clearly mentioned or implied. Do not hallucinate skills.`;

    const userPrompt = `${resumeContent ? `RESUME (extracted text from ${resumeFileName || 'resume.pdf'}):\n${resumeContent}\n\n` : "No resume provided. Assume the candidate is starting from scratch.\n\n"}JOB DESCRIPTION:\n${jobDescription || "No job description provided. Provide a general software engineering skill analysis based on the resume."}`;

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
          { role: "user", content: userPrompt },
        ],
        tools: [{ type: "function", function: ANALYSIS_SCHEMA }],
        tool_choice: { type: "function", function: { name: "analyze_profile" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please wait a moment and try again." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds in Settings." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiData = await response.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall?.function?.arguments) {
      throw new Error("No structured response from AI");
    }

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("analyze-profile error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});