import { describe, it, expect } from "vitest";
import { NotebookCellSchema } from "../src/notebook";

const validCell = {
  id: "00000000-0000-4000-8000-000000000020",
  sourceNotebookId: "00000000-0000-4000-8000-000000000010",
  cellIndex: 0,
  cellType: "markdown" as const,
  source: "# Title",
  classification: "narrative_markdown" as const,
  isNoise: false,
  metadata: {},
  createdAt: "2026-05-28T10:00:00.000Z",
  updatedAt: "2026-05-28T10:00:00.000Z"
};

describe("NotebookCellSchema", () => {
  it("parses a valid markdown cell", () => {
    const result = NotebookCellSchema.parse(validCell);
    expect(result.cellType).toBe("markdown");
    expect(result.source).toBe("# Title");
    expect(result.classification).toBe("narrative_markdown");
  });

  it("parses a valid code cell", () => {
    const result = NotebookCellSchema.parse({
      ...validCell,
      cellIndex: 1,
      cellType: "code" as const,
      source: 'print("x")',
      language: "python",
      executionCount: 1,
      classification: "analysis_code" as const
    });
    expect(result.cellType).toBe("code");
    expect(result.language).toBe("python");
    expect(result.executionCount).toBe(1);
  });

  it("rejects invalid cell type", () => {
    expect(() => NotebookCellSchema.parse({
      ...validCell,
      cellType: "invalid"
    })).toThrow();
  });

  it("rejects negative cell index", () => {
    expect(() => NotebookCellSchema.parse({
      ...validCell,
      cellIndex: -1
    })).toThrow();
  });

  it("accepts unknown cell type as valid enum member", () => {
    const result = NotebookCellSchema.parse({
      ...validCell,
      cellType: "unknown" as const
    });
    expect(result.cellType).toBe("unknown");
  });
});
