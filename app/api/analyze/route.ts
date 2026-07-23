import { NextRequest, NextResponse } from "next/server";
import { parseResumeFile } from "@/lib/parseResume";
import { callDeepSeek, parseModelJson } from "@/lib/llm";
import { FIT_GAP_SYSTEM_PROMPT } from "@/lib/prompts";

export const runtime = "nodejs";

interface FitGapResult {
  overallFit: "strong" | "moderate" | "weak";
  matches: { requirement: string; evidence: string; resumeSection: string }[];
  gaps: { requirement: string; severity: "critical" | "minor"; note: string }[];
  surfacingOpportunities: {
    requirement: string;
    resumeEvidence: string;
    suggestion: string;
  }[];
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const resumeFile = formData.get("resume") as File | null;
    const jobDescription = formData.get("jobDescription") as string | null;

    if (!resumeFile || !jobDescription) {
      return NextResponse.json(
        { error: "Both a resume file and a job description are required." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await resumeFile.arrayBuffer());
    const resumeText = await parseResumeFile(buffer, resumeFile.type);

    if (!resumeText) {
      return NextResponse.json(
        { error: "Could not extract text from the uploaded file." },
        { status: 422 }
      );
    }

    const userContent = `RESUME:\n${resumeText}\n\nJOB DESCRIPTION:\n${jobDescription}`;
    const raw = await callDeepSeek(FIT_GAP_SYSTEM_PROMPT, userContent);

    let result: FitGapResult;
    try {
      result = parseModelJson<FitGapResult>(raw);
    } catch (parseErr) {
      console.error("JSON parse failed. Raw model output:", raw);
      return NextResponse.json(
        {
          error:
            "The AI response wasn't valid JSON. This is a model formatting issue, not a bug in your code. Try again, it usually succeeds on retry.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({ resumeText, analysis: result });
  } catch (err) {
    console.error("Analyze route error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}