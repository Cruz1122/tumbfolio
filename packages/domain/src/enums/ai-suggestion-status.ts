export const AiSuggestionStatus = {
  Pending: "pending",
  Accepted: "accepted",
  Edited: "edited",
  Rejected: "rejected",
  Failed: "failed"
} as const;

export type AiSuggestionStatus = (typeof AiSuggestionStatus)[keyof typeof AiSuggestionStatus];
