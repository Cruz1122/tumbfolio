export const NotebookProcessingStatus = {
  Idle: "idle",
  Queued: "queued",
  Processing: "processing",
  Processed: "processed",
  Failed: "failed"
} as const;

export type NotebookProcessingStatus = (typeof NotebookProcessingStatus)[keyof typeof NotebookProcessingStatus];
