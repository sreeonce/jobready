"use client";

import { FitGapResult } from "@/lib/types";

interface Props {
  analysis: FitGapResult;
}

const fitColors: Record<string, string> = {
  strong: "#4CAF50",
  moderate: "#FFA726",
  weak: "var(--color-error)",
};

const cardStyle: React.CSSProperties = {
  border: "1.5px solid var(--color-border)",
  borderRadius: 12,
  padding: 20,
  marginBottom: 16,
  background: "rgba(218, 192, 252, 0.3)",
};

export default function AnalysisResult({ analysis }: Props) {
  const fitLabel =
    analysis.overallFit.charAt(0).toUpperCase() + analysis.overallFit.slice(1);

  return (
    <div style={{ marginTop: 24 }}>
      {/* Overall fit badge */}
      <div
        style={{
          display: "inline-block",
          padding: "8px 20px",
          borderRadius: 999,
          background: fitColors[analysis.overallFit],
          color: "#fff",
          fontFamily: "var(--font-heading)",
          marginBottom: 24,
        }}
      >
        Overall fit: {fitLabel}
      </div>

      {/* Matches */}
      {analysis.matches.length > 0 && (
        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontFamily: "var(--font-heading)", color: "var(--color-heading)", fontSize: 20 }}>
            ✅ What matches
          </h2>
          {analysis.matches.map((m, i) => (
            <div key={i} style={cardStyle}>
              <p style={{ color: "var(--color-heading)", margin: 0 }}>
                <strong>{m.requirement}</strong>
              </p>
              <p style={{ color: "var(--color-subtext)", margin: "8px 0 0" }}>
                {m.evidence}
              </p>
              <p style={{ color: "var(--color-subtext)", fontSize: 13, fontStyle: "italic", margin: "8px 0 0" }}>
                Found in: {m.resumeSection}
              </p>
            </div>
          ))}
        </section>
      )}

      {/* Gaps */}
      {analysis.gaps.length > 0 && (
        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontFamily: "var(--font-heading)", color: "var(--color-heading)", fontSize: 20 }}>
            ⚠️ What's missing
          </h2>
          {analysis.gaps.map((g, i) => (
            <div key={i} style={cardStyle}>
              <p style={{ color: "var(--color-heading)", margin: 0 }}>
                <strong>{g.requirement}</strong>{" "}
                <span
                  style={{
                    fontSize: 12,
                    color: g.severity === "critical" ? "var(--color-error)" : "var(--color-subtext)",
                    fontStyle: "italic",
                  }}
                >
                  ({g.severity})
                </span>
              </p>
              <p style={{ color: "var(--color-subtext)", margin: "8px 0 0" }}>
                {g.note}
              </p>
            </div>
          ))}
        </section>
      )}

      {/* Surfacing opportunities */}
      {analysis.surfacingOpportunities.length > 0 && (
        <section>
          <h2 style={{ fontFamily: "var(--font-heading)", color: "var(--color-heading)", fontSize: 20 }}>
            💡 Worth highlighting
          </h2>
          {analysis.surfacingOpportunities.map((s, i) => (
            <div key={i} style={cardStyle}>
              <p style={{ color: "var(--color-heading)", margin: 0 }}>
                <strong>{s.requirement}</strong>
              </p>
              <p style={{ color: "var(--color-subtext)", margin: "8px 0 0" }}>
                {s.resumeEvidence}
              </p>
              <p style={{ color: "var(--color-subtext)", fontSize: 13, fontStyle: "italic", margin: "8px 0 0" }}>
                Suggestion: {s.suggestion}
              </p>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}