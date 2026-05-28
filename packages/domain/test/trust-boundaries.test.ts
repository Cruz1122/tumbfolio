import { describe, it, expect } from "vitest";
import {
  UploadedNotebookMetadataSchema,
  ClientUpdateSlideSchema,
  ClientUpdateBlockVisibilitySchema,
  ClientReorderSlidesSchema,
  ClientChangeThemeSchema,
  ClientChangeModeSchema,
  NbxpImportedPresentationDocumentSchema,
  BackendPresentationDocumentSchema
} from "../src/validation";
import { presentationDocumentFixture } from "../src/fixtures";

describe("UploadedNotebookMetadataSchema", () => {
  it("parses valid upload metadata", () => {
    const result = UploadedNotebookMetadataSchema.parse({
      originalFilename: "analysis.ipynb",
      fileSizeBytes: 10240,
      nbformat: 4,
      nbformatMinor: 5
    });
    expect(result.originalFilename).toBe("analysis.ipynb");
  });

  it("rejects extra unknown keys", () => {
    expect(() => UploadedNotebookMetadataSchema.parse({
      originalFilename: "analysis.ipynb",
      fileSizeBytes: 10240,
      nbformat: 4,
      nbformatMinor: 5,
      extraField: "should not be here"
    })).toThrow();
  });

  it("rejects missing required fields", () => {
    expect(() => UploadedNotebookMetadataSchema.parse({
      originalFilename: "analysis.ipynb"
    })).toThrow();
  });
});

describe("ClientUpdateSlideSchema", () => {
  it("parses a valid slide update", () => {
    const result = ClientUpdateSlideSchema.parse({
      slideId: "slide-001",
      title: "New Title",
      layout: "content"
    });
    expect(result.title).toBe("New Title");
    expect(result.layout).toBe("content");
  });

  it("rejects extra keys", () => {
    expect(() => ClientUpdateSlideSchema.parse({
      slideId: "slide-001",
      unknownField: true
    })).toThrow();
  });
});

describe("ClientUpdateBlockVisibilitySchema", () => {
  it("parses a visibility update", () => {
    const result = ClientUpdateBlockVisibilitySchema.parse({
      slideId: "slide-001",
      visibility: { showCode: false, showOutput: true }
    });
    expect(result.visibility.showCode).toBe(false);
  });

  it("rejects extra keys", () => {
    expect(() => ClientUpdateBlockVisibilitySchema.parse({
      slideId: "slide-001",
      visibility: { showCode: true },
      extra: "bad"
    })).toThrow();
  });
});

describe("ClientReorderSlidesSchema", () => {
  it("parses a reorder request", () => {
    const result = ClientReorderSlidesSchema.parse({
      slideIds: ["slide-001", "slide-002"]
    });
    expect(result.slideIds).toHaveLength(2);
  });
});

describe("ClientChangeThemeSchema", () => {
  it("parses a theme change", () => {
    const result = ClientChangeThemeSchema.parse({
      themeId: "theme-colab-clean"
    });
    expect(result.themeId).toBe("theme-colab-clean");
  });
});

describe("ClientChangeModeSchema", () => {
  it("parses a mode change", () => {
    const result = ClientChangeModeSchema.parse({
      mode: "executive"
    });
    expect(result.mode).toBe("executive");
  });

  it("rejects invalid mode", () => {
    expect(() => ClientChangeModeSchema.parse({
      mode: "invalid_mode"
    })).toThrow();
  });
});

describe("NbxpImportedPresentationDocumentSchema", () => {
  it("accepts a valid fixture document (strict)", () => {
    const result = NbxpImportedPresentationDocumentSchema.parse(presentationDocumentFixture);
    expect(result.presentationModelVersion).toBe("1.0.0");
  });

  it("rejects document with extra unknown keys", () => {
    expect(() => NbxpImportedPresentationDocumentSchema.parse({
      ...presentationDocumentFixture,
      unknownRootKey: "should fail"
    })).toThrow();
  });
});

describe("BackendPresentationDocumentSchema", () => {
  it("accepts a valid fixture document", () => {
    const result = BackendPresentationDocumentSchema.parse(presentationDocumentFixture);
    expect(result.presentation.title).toBe("Analysis Report");
  });

  it("rejects extra keys", () => {
    expect(() => BackendPresentationDocumentSchema.parse({
      ...presentationDocumentFixture,
      extraField: "bad"
    })).toThrow();
  });
});
