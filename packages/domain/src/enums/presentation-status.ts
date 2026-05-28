export const PresentationStatus = {
  Draft: "draft",
  Ready: "ready",
  Archived: "archived"
} as const;

export type PresentationStatus = (typeof PresentationStatus)[keyof typeof PresentationStatus];
