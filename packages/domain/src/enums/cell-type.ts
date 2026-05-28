export const CellType = {
  Markdown: "markdown",
  Code: "code",
  Raw: "raw",
  Unknown: "unknown"
} as const;

export type CellType = (typeof CellType)[keyof typeof CellType];
