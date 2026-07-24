"use client";

import { useState } from "react";
import { TailoringSuggestion, ReviewableSuggestion } from "@/lib/types";

interface Props {
  suggestions: TailoringSuggestion[];
}

const actionButtonStyle: React.CSSProperties = {
  background: "var(--color-heading)",
  color: "#fff",
  fontFamily: "var(--font-heading)",
  fontSize: 13,
  border: "none",
  borderRadius: 6,
  padding: "6px 14px",
  cursor: "pointer",
};

export default function SuggestionsReview({ suggestions }: Props) {
  const [reviewable, setReviewable] = useState<ReviewableSuggestion[]>(
    suggestions.map((s) => ({
      ...s,
      status: "pending",
      editedText: s.proposed,
    }))
  );

  // Tracks which suggestion is currently being actively edited (textarea
  // open), separate from `status`, since "editing" is a temporary UI mode,
  // not a final decision like accepted/rejected/edited are.
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftText, setDraftText] = useState("");

  function accept(id: string) {
    setReviewable((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "accepted" } : s))
    );
  }

  function reject(id: string) {
    setReviewable((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "rejected" } : s))
    );
  }

  function startEditing(s: ReviewableSuggestion) {
    setEditingId(s.id);
    setDraftText(s.editedText);
  }

  function submitEdit(id: string) {
    setReviewable((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, editedText: draftText, status: "edited" } : s
      )
    );
    setEditingId(null);
  }

  function resetToPending(id: string) {
    setReviewable((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, status: "pending", editedText: s.proposed }
          : s
      )
    );
    if (editingId === id) setEditingId(null);
  }

  const acceptedCount = reviewable.filter(
    (s) => s.status === "accepted" || s.status === "edited"
  ).length;

  return (
    <div>
      <p style={{ color: "var(--color-subtext)" }}>
        {acceptedCount} of {reviewable.length} suggestions accepted
      </p>

      {reviewable.map((s) => {
        const isEditing = editingId === s.id;

        return (
          <div
            key={s.id}
            data-status={s.status}
            style={{
              border: "1.5px solid var(--color-border)",
              borderRadius: 12,
              padding: 20,
              marginBottom: 16,
              background: "rgba(255,255,255,0.4)",
            }}
          >
            <p style={{ color: "var(--color-heading)" }}>
              <strong>Section:</strong> {s.section}
            </p>
            <p style={{ color: "var(--color-subtext)" }}>
              <strong>Original:</strong> {s.original}
            </p>

            {isEditing ? (
              <textarea
                value={draftText}
                onChange={(e) => setDraftText(e.target.value)}
                rows={4}
                style={{
                  width: "100%",
                  border: "1.5px solid var(--color-border)",
                  borderRadius: 12,
                  padding: 12,
                  marginTop: 8,
                  marginBottom: 8,
                  background: "rgba(255,255,255,0.6)",
                  color: "var(--color-subtext)",
                  fontFamily: "var(--font-body)",
                  resize: "vertical",
                }}
              />
            ) : (
              <p style={{ color: "var(--color-subtext)" }}>
                <strong>Proposed:</strong> {s.editedText}
              </p>
            )}

            <p style={{ color: "var(--color-subtext)", fontStyle: "italic" }}>
              {s.reason}
            </p>

            <p style={{ color: "var(--color-subtext)" }}>Status: {s.status}</p>

            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              {isEditing ? (
                <button
                  onClick={() => submitEdit(s.id)}
                  style={actionButtonStyle}
                >
                  Submit
                </button>
              ) : s.status === "pending" ? (
                <>
                  <button onClick={() => accept(s.id)} style={actionButtonStyle}>
                    Accept
                  </button>
                  <button onClick={() => reject(s.id)} style={actionButtonStyle}>
                    Reject
                  </button>
                  <button
                    onClick={() => startEditing(s)}
                    style={actionButtonStyle}
                  >
                    Edit
                  </button>
                </>
              ) : (
                <button
                  onClick={() => resetToPending(s.id)}
                  style={actionButtonStyle}
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}