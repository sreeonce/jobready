export interface FitGapResult {
  overallFit: "strong" | "moderate" | "weak";
  matches: { requirement: string; evidence: string; resumeSection: string }[];
  gaps: { requirement: string; severity: "critical" | "minor"; note: string }[];
  surfacingOpportunities: {
    requirement: string;
    resumeEvidence: string;
    suggestion: string;
  }[];
}

export interface TailoringSuggestion {
  id: string;
  section: string;
  original: string;
  proposed: string;
  reason: string;
}

export type SuggestionStatus = "pending" | "accepted" | "rejected" | "edited";

export interface ReviewableSuggestion extends TailoringSuggestion {
  status: SuggestionStatus;
  editedText: string; // starts equal to `proposed`, changes if user edits
}