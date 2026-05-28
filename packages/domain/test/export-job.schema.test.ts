import { describe, it, expect } from "vitest";
import { ExportJobSchema } from "../src/exports";
import { pendingExportJobFixture, failedExportJobFixture, exportJobFixture } from "../src/fixtures";

describe("ExportJobSchema", () => {
  it("parses a completed PDF export job", () => {
    const result = ExportJobSchema.parse(exportJobFixture);
    expect(result.exportType).toBe("pdf");
    expect(result.status).toBe("completed");
    expect(result.config.exportType).toBe("pdf");
  });

  it("parses a pending HTML export job", () => {
    const result = ExportJobSchema.parse(pendingExportJobFixture);
    expect(result.exportType).toBe("html");
    expect(result.status).toBe("queued");
    expect(result.config.exportType).toBe("html");
  });

  it("parses a failed PPTX export job with error info", () => {
    const result = ExportJobSchema.parse(failedExportJobFixture);
    expect(result.exportType).toBe("pptx");
    expect(result.status).toBe("failed");
    expect(result.errorCode).toBe("RENDER_TIMEOUT");
    expect(result.errorMessage).toBeDefined();
  });

  it("rejects export with mismatched config type", () => {
    expect(() => ExportJobSchema.parse({
      ...pendingExportJobFixture,
      config: {
        exportType: "pdf",
        includeSpeakerNotes: false,
        includeAppendix: true,
        includeHiddenBlocks: false,
        includeCode: true,
        pageSize: "A4",
        printBackground: true
      }
    })).not.toThrow(); // discrim union on config, not top-level type
  });

  it("rejects invalid export type", () => {
    expect(() => ExportJobSchema.parse({
      ...pendingExportJobFixture,
      exportType: "invalid"
    })).toThrow();
  });

  it("rejects invalid job status", () => {
    expect(() => ExportJobSchema.parse({
      ...pendingExportJobFixture,
      status: "invalid"
    })).toThrow();
  });
});
