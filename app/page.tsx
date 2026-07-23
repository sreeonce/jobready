"use client";

import { useState } from "react";
import SuggestionsReview from "@/components/SuggestionsReview";
import { TailoringSuggestion } from "@/lib/types";

export default function Home() {
  const [resume, setResume] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forceShowButton, setForceShowButton] = useState(false);

  const [suggestions, setSuggestions] = useState<TailoringSuggestion[] | null>(null);
  const [tailorLoading, setTailorLoading] = useState(false);
  const [tailorError, setTailorError] = useState<string | null>(null);

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
    <main style={{ maxWidth: 700, margin: "40px auto", padding: 16 }}>
      <h1>JobReady — fit/gap test</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>Resume (PDF or DOCX)</label><br />
          <input type="file" accept=".pdf,.docx" onChange={(e) => setResume(e.target.files?.[0] ?? null)} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Job description</label><br />
          <textarea rows={10} style={{ width: "100%" }} value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} placeholder="Paste the job description here" />
        </div>
        <button type="submit" disabled={loading}>{loading ? "Analyzing..." : "Analyze fit"}</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {result && <pre style={{ marginTop: 24, background: "#f4f4f4", padding: 16, whiteSpace: "pre-wrap" }}>{JSON.stringify(result, null, 2)}</pre>}

      {result && (() => {
  const analysis = result.analysis;
  const hasNoRealOverlap =
    analysis?.overallFit === "weak" && (analysis?.matches?.length ?? 0) === 0;

  if (hasNoRealOverlap && !forceShowButton) {
    return (
      <div style={{ marginTop: 16 }}>
        <p>
          This resume and job description don't have enough overlap for
          tailoring suggestions to be meaningful. JobReady only rewords real
          experience, it won't invent a fit that isn't there.
        </p>
        <button onClick={() => setForceShowButton(true)}>
          I still want to see suggestions
        </button>
      </div>
    );
  }

  return (
    <button onClick={handleGenerateSuggestions} disabled={tailorLoading}>
      {tailorLoading ? "Generating suggestions..." : "Generate tailoring suggestions"}
    </button>
  );
})()}
      {tailorError && <p style={{ color: "red" }}>{tailorError}</p>}
      {suggestions && <SuggestionsReview suggestions={suggestions} />}
    </main>
  );
}