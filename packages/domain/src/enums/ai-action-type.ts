export const AiActionType = {
  GenerateTitle: "generate_title",
  ImproveTitle: "improve_title",
  SummarizeSlide: "summarize_slide",
  GenerateSpeakerNotes: "generate_speaker_notes",
  ExplainForTeaching: "explain_for_teaching",
  MakeExecutive: "make_executive",
  SuggestVisibility: "suggest_visibility",
  ProposeConclusion: "propose_conclusion"
} as const;

export type AiActionType = (typeof AiActionType)[keyof typeof AiActionType];
