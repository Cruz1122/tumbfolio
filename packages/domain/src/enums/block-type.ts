export const SlideBlockType = {
  Markdown: "markdown",
  Code: "code",
  Output: "output",
  Image: "image",
  Table: "table",
  Html: "html",
  Latex: "latex",
  Log: "log",
  Error: "error",
  AiSummary: "ai_summary",
  Placeholder: "placeholder"
} as const;

export type SlideBlockType = (typeof SlideBlockType)[keyof typeof SlideBlockType];
