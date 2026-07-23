"use client";

import { useState } from "react";
import { TailoringSuggestion, ReviewableSuggestion } from "@/lib/types";

interface Props {
  suggestions: TailoringSuggestion[];
}

export default function SuggestionsReview({ suggestions }: Props) {
  const [reviewable, setReviewable] = useState<ReviewableSuggestion[]>(
    suggestions.map((s) => ({
      ...s,
      status: "pending",
      editedText: s.proposed,
    }))
  );

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

  function updateEditedText(id: string, text: string) {
    setReviewable((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, editedText: text, status: "edited" } : s
      )
    );
  }

  function resetToPending(id: string) {
    setReviewable((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, status: "pending", editedText: s.proposed }
          : s
      )
    );
  }

  const acceptedCount = reviewable.filter(
    (s) => s.status === "accepted" || s.status === "edited"
  ).length;

  return (
    <div>
      <p>
        {acceptedCount} of {reviewable.length} suggestions accepted
      </p>

      {reviewable.map((s) => (
        <div key={s.id} data-status={s.status}>
          <p>
            <strong>Section:</strong> {s.section}
          </p>
          <p>
            <strong>Original:</strong> {s.original}
          </p>

          {s.status === "edited" ? (
            <textarea
              value={s.editedText}
              onChange={(e) => updateEditedText(s.id, e.target.value)}
            />
          ) : (
            <p>
              <strong>Proposed:</strong> {s.proposed}
            </p>
          )}

          <p>
            <em>{s.reason}</em>
          </p>

          <p>Status: {s.status}</p>

          <button onClick={() => accept(s.id)} disabled={s.status === "accepted"}>
            Accept
          </button>
          <button onClick={() => reject(s.id)} disabled={s.status === "rejected"}>
            Reject
          </button>
          <button onClick={() => updateEditedText(s.id, s.proposed)}>
            Edit
          </button>
          {s.status !== "pending" && (
            <button onClick={() => resetToPending(s.id)}>Reset</button>
          )}
        </div>
      ))}
    </div>
  );
}