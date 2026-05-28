import { describe, it, expect } from "vitest";
import { SourceNotebookSchema } from "../src/notebook";

const validSourceNotebook = {
  id: "00000000-0000-4000-8000-000000000010",
  projectId: "00000000-0000-4000-8000-000000000001",
  originalFilename: "test.ipynb",
  storageKey: "notebooks/2026-01/test.ipynb",
  fileSizeBytes: 1024,
  sha256: "a".repeat(64),
  nbformat: 4,
  nbformatMinor: 5,
  validationStatus: "valid" as const,
  validationErrors: [],
  validationWarnings: [],
  processingStatus: "processed" as const,
  cellCount: 3,
  outputCount: 5,
  detectedMimeTypes: ["text/plain", "text/html"],
  metadata: {},
  createdAt: "2026-05-28T10:00:00.000Z",
  updatedAt: "2026-05-28T10:00:00.000Z"
};

describe("SourceNotebookSchema", () => {
  it("parses a valid source notebook", () => {
    const result = SourceNotebookSchema.parse(validSourceNotebook);
    expect(result.id).toBe(validSourceNotebook.id);
    expect(result.validationStatus).toBe("valid");
    expect(result.processingStatus).toBe("processed");
    expect(result.cellCount).toBe(3);
    expect(result.outputCount).toBe(5);
  });

  it("applies default values for optional fields", () => {
    const minimal = SourceNotebookSchema.parse({
      id: "00000000-0000-4000-8000-000000000010",
      projectId: "00000000-0000-4000-8000-000000000001",
      originalFilename: "test.ipynb",
      storageKey: "notebooks/2026-01/test.ipynb",
      validationStatus: "pending",
      processingStatus: "idle",
      cellCount: 0,
      outputCount: 0,
      metadata: {},
      createdAt: "2026-05-28T10:00:00.000Z",
      updatedAt: "2026-05-28T10:00:00.000Z"
    });
    expect(minimal.validationErrors).toEqual([]);
    expect(minimal.validationWarnings).toEqual([]);
    expect(minimal.detectedMimeTypes).toEqual([]);
  });

  it("rejects invalid UUID", () => {
    expect(() => SourceNotebookSchema.parse({
      ...validSourceNotebook,
      id: "not-a-uuid"
    })).toThrow();
  });

  it("rejects invalid validation status", () => {
    expect(() => SourceNotebookSchema.parse({
      ...validSourceNotebook,
      validationStatus: "invalid_value"
    })).toThrow();
  });

  it("rejects invalid processing status", () => {
    expect(() => SourceNotebookSchema.parse({
      ...validSourceNotebook,
      processingStatus: "invalid_value"
    })).toThrow();
  });

  it("rejects negative cell count", () => {
    expect(() => SourceNotebookSchema.parse({
      ...validSourceNotebook,
      cellCount: -1
    })).toThrow();
  });

  it("rejects bad sha256 format", () => {
    expect(() => SourceNotebookSchema.parse({
      ...validSourceNotebook,
      sha256: "tooshort"
    })).toThrow();
  });
});
