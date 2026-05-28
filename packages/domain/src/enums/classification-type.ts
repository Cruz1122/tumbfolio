export const CellClassification = {
  NarrativeMarkdown: "narrative_markdown",
  SetupCode: "setup_code",
  AnalysisCode: "analysis_code",
  VisualizationCode: "visualization_code",
  ModelingCode: "modeling_code",
  TableOutput: "table_output",
  FigureOutput: "figure_output",
  LogOutput: "log_output",
  ErrorOutput: "error_output",
  Noise: "noise"
} as const;

export type CellClassification = (typeof CellClassification)[keyof typeof CellClassification];
