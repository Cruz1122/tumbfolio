import { describe, it, expect } from "vitest";
import { AiSuggestionSchema } from "../src/ai";
import { pendingAiSuggestionFixture, acceptedAiSuggestionFixture } from "../src/fixtures";

describe("AiSuggestionSchema", () => {
  it("parses a pending suggestion", () => {
    const result = AiSuggestionSchema.parse(pendingAiSuggestionFixture);
    expect(result.actionType).toBe("generate_title");
    expect(result.status).toBe("pending");
    expect(result.acceptedPayload).toBeUndefined();
  });

  it("parses an accepted suggestion with payload", () => {
    const result = AiSuggestionSchema.parse(acceptedAiSuggestionFixture);
    expect(result.actionType).toBe("summarize_slide");
    expect(result.status).toBe("accepted");
    expect(result.acceptedPayload).toBeDefined();
  });

  it("rejects invalid action type", () => {
    expect(() => AiSuggestionSchema.parse({
      ...pendingAiSuggestionFixture,
      actionType: "unknown_action"
    })).toThrow();
  });

  it("rejects invalid status", () => {
    expect(() => AiSuggestionSchema.parse({
      ...pendingAiSuggestionFixture,
      status: "invalid"
    })).toThrow();
  });
});
