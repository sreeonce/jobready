"use client";

import AnalysisResult from "@/components/AnalysisResult";
import { useState } from "react";
import SuggestionsReview from "@/components/SuggestionsReview";
import { TailoringSuggestion, ReviewableSuggestion } from "@/lib/types";

export default function Home() {
  const [resume, setResume] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [finalSuggestions, setFinalSuggestions] = useState<ReviewableSuggestion[] | null>(null);
  const [suggestions, setSuggestions] = useState<TailoringSuggestion[] | null>(null);
  const [tailorLoading, setTailorLoading] = useState(false);
  const [tailorError, setTailorError] = useState<string | null>(null);
  const [forceShowButton, setForceShowButton] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!resume || !jobDescription.trim()) {
      setError("Upload a resume and paste the job description first.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("resume", resume);
    formData.append("jobDescription", jobDescription);

    try {
      const res = await fetch("/api/analyze", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed.");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateSuggestions() {
    if (!result) return;
    setTailorLoading(true);
    setTailorError(null);
    setSuggestions(null);

    try {
      const res = await fetch("/api/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText: result.resumeText,
          jobDescription,
          analysis: result.analysis,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed.");
      setSuggestions(data.suggestions);
    } catch (err) {
      setTailorError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setTailorLoading(false);
    }
  }

  return (
    <main
      style={{
        maxWidth: 950,
        margin: "0 auto",
        padding: "56px 24px",
      }}
    >
      <h1
        style={{
          fontFamily: "var(--font-heading)",
          color: "var(--color-heading)",
          textAlign: "center",
          fontSize: 32,
          marginBottom: 8,
        }}
      >
        JobReady – AI Resume Tailoring Tool
      </h1>
      <p
        style={{
          textAlign: "center",
          color: "var(--color-subtext)",
          marginBottom: 40,
        }}
      >
        Tailored to the job. True to you.
      </p>

      <form onSubmit={handleSubmit}>
        <label
          htmlFor="resume-upload"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            border: "1.5px solid var(--color-border)",
            borderRadius: 12,
            padding: "48px 24px",
            marginBottom: 24,
            cursor: "pointer",
            background: "rgba(218, 192, 252, 0.4)",
          }}
        >
          <span style={{ color: "var(--color-subtext)", marginBottom: 12 }}>
            {resume ? resume.name : "Upload your CV (.txt, .docx, .pdf)"}
          </span>
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-heading)"
            strokeWidth="1.5"
          >
            <path
              d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M14 2v6h6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <input
            id="resume-upload"
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={(e) => setResume(e.target.files?.[0] ?? null)}
            style={{ display: "none" }}
          />
        </label>

        <label
          style={{
            display: "block",
            color: "var(--color-subtext)",
            marginBottom: 8,
          }}
        >
          Job Description
        </label>
        <textarea
          rows={15}
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          style={{
            width: "100%",
            border: "1.5px solid var(--color-border)",
            borderRadius: 12,
            padding: 16,
            marginBottom: 24,
            background: "rgba(218, 192, 252, 0.4)",
            color: "var(--color-subtext)",
            fontFamily: "var(--font-body)",
            resize: "vertical",
          }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            background: "var(--color-heading)",
            color: "#fff",
            fontFamily: "var(--font-heading)",
            border: "none",
            borderRadius: 8,
            padding: "14px 32px",
            fontSize: 16,
            cursor: "pointer",
          }}
        >
          {loading ? "Analyzing..." : "Analyze"}
        </button>
      </form>

      {error && (
        <p style={{ color: "var(--color-error)", marginTop: 16 }}>{error}</p>
      )}

      {result && <AnalysisResult analysis={result.analysis} />}

      {result &&
        (() => {
          const analysis = result.analysis;
          const hasNoRealOverlap =
            analysis?.overallFit === "weak" &&
            (analysis?.matches?.length ?? 0) === 0;

          if (hasNoRealOverlap && !forceShowButton) {
            return (
              <div style={{ marginTop: 16 }}>
                <p style={{ color: "var(--color-error)" }}>
                  This resume and job description don't have enough overlap
                  for tailoring suggestions to be meaningful. JobReady only
                  rewords real experience, it won't invent a fit that isn't
                  there.
                </p>
                <button
                  onClick={() => setForceShowButton(true)}
                  style={{
                    background: "var(--color-heading)",
                    color: "#fff",
                    fontFamily: "var(--font-heading)",
                    fontSize: 16,
                    border: "none",
                    borderRadius: 8,
                    padding: "14px 32px",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  I would still like to see suggestions
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff">
                    <path d="M12 2l1.5 6.5L20 10l-6.5 1.5L12 18l-1.5-6.5L4 10l6.5-1.5z" />
                    <path d="M19 15l0.6 2.4L22 18l-2.4 0.6L19 21l-0.6-2.4L16 18l2.4-0.6z" />
                    <path d="M5 15l0.5 1.5L7 17l-1.5 0.5L5 19l-0.5-1.5L3 17l1.5-0.5z" />
                  </svg>
                </button>
              </div>
            );
          }

          return (
            <button
              onClick={handleGenerateSuggestions}
              disabled={tailorLoading}
              style={{
                marginTop: 16,
                background: "var(--color-heading)",
                color: "#fff",
                fontFamily: "var(--font-heading)",
                fontSize: 16,
                border: "none",
                borderRadius: 8,
                padding: "14px 32px",
                cursor: "pointer",
              }}
            >
              {tailorLoading
                ? "Generating suggestions..."
                : "Generate tailoring suggestions"}
            </button>
          );
        })()}

      {tailorError && (
        <p style={{ color: "var(--color-error)", marginTop: 16 }}>
          {tailorError}
        </p>
      )}
      {suggestions && (
        <SuggestionsReview suggestions={suggestions} onChange={setFinalSuggestions} />
      )}
    </main>
  );
}