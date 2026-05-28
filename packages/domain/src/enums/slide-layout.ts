export const SlideLayout = {
  Title: "title",
  Section: "section",
  Content: "content",
  CodeOutput: "code_output",
  OutputFocus: "output_focus",
  FigureFocus: "figure_focus",
  TableFocus: "table_focus",
  Comparison: "comparison",
  Appendix: "appendix"
} as const;

export type SlideLayout = (typeof SlideLayout)[keyof typeof SlideLayout];
