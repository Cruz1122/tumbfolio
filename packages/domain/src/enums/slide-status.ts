export const SlideStatus = {
  Normal: "normal",
  TooDense: "too_dense",
  HasUnsupportedOutput: "has_unsupported_output",
  HasHiddenLogs: "has_hidden_logs",
  NeedsReview: "needs_review"
} as const;

export type SlideStatus = (typeof SlideStatus)[keyof typeof SlideStatus];
