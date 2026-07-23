import { NextRequest, NextResponse } from "next/server";
import { callDeepSeek, parseModelJson } from "@/lib/llm";
import { TAILORING_SYSTEM_PROMPT } from "@/lib/prompts";
import { TailoringSuggestion } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { resumeText, jobDescription, analysis } = body as {
      resumeText?: string;
      jobDescription?: string;
      analysis?: unknown;
    };

    if (!resumeText || !jobDescription) {
      return NextResponse.json(
        { error: "resumeText and jobDescription are both required." },
        { status: 400 }
      );
    }

    const userContent = `RESUME:\n${resumeText}\n\nJOB DESCRIPTION:\n${jobDescription}\n\nFIT/GAP ANALYSIS (for context, do not repeat it, use it to inform which sections need surfacing):\n${JSON.stringify(
      analysis ?? {}
    )}`;

    const raw = await callDeepSeek(TAILORING_SYSTEM_PROMPT, userContent);

    let result: { suggestions: TailoringSuggestion[] };
    try {
      result = parseModelJson<{ suggestions: TailoringSuggestion[] }>(raw);
    } catch (parseErr) {
      console.error("Tailor JSON parse failed. Raw output:", raw);
      return NextResponse.json(
        {
          error:
            "The AI response wasn't valid JSON. This is a model formatting issue, try again.",
        },
        { status: 502 }
      );
    }

    // Guarantee every suggestion has a stable, unique id even if the model
    // slips up and reuses one — the frontend keys off this.
    const withSafeIds = result.suggestions.map((s, i) => ({
      ...s,
      id: s.id || `suggestion-${i}`,
    }));

    return NextResponse.json({ suggestions: withSafeIds });
  } catch (err) {
    console.error("Tailor route error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}