export const JobStatus = {
  Queued: "queued",
  Running: "running",
  Completed: "completed",
  Failed: "failed",
  Expired: "expired"
} as const;

export type JobStatus = (typeof JobStatus)[keyof typeof JobStatus];
