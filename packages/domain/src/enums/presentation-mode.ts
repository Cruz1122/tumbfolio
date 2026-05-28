export const PresentationMode = {
  Default: "default",
  Executive: "executive",
  Teaching: "teaching",
  Research: "research"
} as const;

export type PresentationMode = (typeof PresentationMode)[keyof typeof PresentationMode];
