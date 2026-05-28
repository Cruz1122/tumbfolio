import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  analyzeNotebookJson,
  NotebookReasonCode,
} from "../src/index.js";

const fixturesDir = join(import.meta.dirname, "fixtures");

function readFixture(name: string) {
  return readFileSync(join(fixturesDir, name), "utf8");
}

describe("analyzeNotebookJson", () => {
  it("marks corrupt notebook as fatal invalid JSON", () => {
    const result = analyzeNotebookJson(readFixture("corrupt.ipynb"));

    expect(result.valid).toBe(false);
    expect(result.errors).toEqual([
      {
        code: NotebookReasonCode.InvalidJson,
        message: "Notebook is not valid JSON.",
      },
    ]);
  });

  it("marks notebook without nbformat as unsupported", () => {
    const result = analyzeNotebookJson(readFixture("missing-nbformat.ipynb"));

    expect(result.valid).toBe(false);
    expect(result.errors[0]?.code).toBe(NotebookReasonCode.UnsupportedNbformat);
  });

  it("keeps markdown-only notebook as valid with no-outputs warning", () => {
    const result = analyzeNotebookJson(readFixture("markdown-only.ipynb"));

    expect(result.valid).toBe(true);
    expect(result.cellCount).toBe(1);
    expect(result.outputCount).toBe(0);
    expect(result.warnings).toEqual([
      {
        code: NotebookReasonCode.NoOutputs,
        message:
          "Notebook has no executed outputs, but markdown content is available.",
      },
    ]);
  });

  it("detects mime types and output counts for executed notebook", () => {
    const result = analyzeNotebookJson(readFixture("html-output.ipynb"));

    expect(result.valid).toBe(true);
    expect(result.outputCount).toBe(1);
    expect(result.detectedMimeTypes).toEqual(["text/html"]);
    expect(result.outputTypes.display_data).toBe(1);
  });
});
