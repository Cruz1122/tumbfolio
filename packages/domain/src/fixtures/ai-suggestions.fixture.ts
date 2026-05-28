import { AiSuggestionSchema, type AiSuggestion } from "../ai/index.js";

export const pendingAiSuggestionFixture: AiSuggestion = AiSuggestionSchema.parse({
  id: "00000000-0000-4000-8000-000000000100",
  presentationId: "00000000-0000-4000-8000-000000000040",
  slideId: "00000000-0000-4000-8000-000000000050",
  actionType: "generate_title",
  status: "pending",
  inputContext: {
    cellCount: 3,
    outputTypes: ["text/plain", "image/png"],
    markdownContent: "# Analysis\n\nResults show growth."
  },
  suggestion: {
    title: "Growth Analysis Results",
    subtitle: "Key findings from Q1 data"
  },
  createdAt: "2026-05-28T10:30:00.000Z",
  updatedAt: "2026-05-28T10:30:00.000Z"
});

export const acceptedAiSuggestionFixture: AiSuggestion = AiSuggestionSchema.parse({
  id: "00000000-0000-4000-8000-000000000101",
  presentationId: "00000000-0000-4000-8000-000000000040",
  slideId: "00000000-0000-4000-8000-000000000050",
  targetBlockId: "00000000-0000-4000-8000-000000000064",
  actionType: "summarize_slide",
  status: "accepted",
  inputContext: {
    slideLayout: "figure_focus",
    blockCount: 2
  },
  suggestion: {
    text: "Revenue grew 20% QoQ with strong retention metrics."
  },
  acceptedPayload: {
    text: "Revenue grew 20% QoQ with strong retention metrics."
  },
  createdAt: "2026-05-28T10:30:00.000Z",
  updatedAt: "2026-05-28T10:35:00.000Z"
});
