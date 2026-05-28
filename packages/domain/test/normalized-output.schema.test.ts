import { describe, it, expect } from "vitest";
import { NormalizedOutputSchema } from "../src/notebook";

const validOutput = {
  id: "00000000-0000-4000-8000-000000000030",
  sourceNotebookId: "00000000-0000-4000-8000-000000000010",
  sourceCellId: "00000000-0000-4000-8000-000000000021",
  outputIndex: 0,
  outputType: "execute_result" as const,
  mimeType: "text/plain",
  availableMimeTypes: ["text/plain"],
  data: { "text/plain": "hello" },
  text: "hello",
  metadata: {},
  priority: 0,
  isNoise: false,
  renderStrategy: "plain_text" as const,
  createdAt: "2026-05-28T10:00:00.000Z",
  updatedAt: "2026-05-28T10:00:00.000Z"
};

describe("NormalizedOutputSchema", () => {
  it("parses a valid text output", () => {
    const result = NormalizedOutputSchema.parse(validOutput);
    expect(result.outputType).toBe("execute_result");
    expect(result.renderStrategy).toBe("plain_text");
    expect(result.data).toEqual({ "text/plain": "hello" });
  });

  it("parses an output with asset reference", () => {
    const result = NormalizedOutputSchema.parse({
      ...validOutput,
      outputType: "display_data" as const,
      mimeType: "image/png",
      renderStrategy: "image" as const,
      assetId: "00000000-0000-4000-8000-000000000070"
    });
    expect(result.assetId).toBeDefined();
    expect(result.renderStrategy).toBe("image");
  });

  it("parses a stream output", () => {
    const result = NormalizedOutputSchema.parse({
      ...validOutput,
      outputType: "stream" as const,
      renderStrategy: "stream" as const,
      text: "log line"
    });
    expect(result.outputType).toBe("stream");
  });

  it("parses an error output with traceback", () => {
    const result = NormalizedOutputSchema.parse({
      ...validOutput,
      outputType: "error" as const,
      renderStrategy: "error" as const,
      errorName: "ValueError",
      errorValue: "invalid input",
      traceback: ["Traceback...", "  File <stdin> line 1"]
    });
    expect(result.errorName).toBe("ValueError");
    expect(result.traceback).toHaveLength(2);
  });

  it("rejects invalid output type", () => {
    expect(() => NormalizedOutputSchema.parse({
      ...validOutput,
      outputType: "inline"
    })).toThrow();
  });

  it("rejects invalid UUID for sourceCellId", () => {
    expect(() => NormalizedOutputSchema.parse({
      ...validOutput,
      sourceCellId: "bad"
    })).toThrow();
  });
});
