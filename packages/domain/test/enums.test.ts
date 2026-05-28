import { describe, it, expect } from "vitest";
import { z } from "zod";
import {
  CellType,
  OutputType,
  RenderStrategy,
  SlideLayout,
  SlideStatus,
  PresentationMode,
  ExportType,
  AssetType,
  SlideBlockType,
  JobStatus,
  AiSuggestionStatus,
  NotebookValidationStatus,
  NotebookProcessingStatus,
  PresentationStatus,
  AiActionType,
  CellClassification
} from "../src/enums";

function makeEnumSchema<T extends Record<string, string>>(obj: T) {
  return z.nativeEnum(obj);
}

describe("CellType", () => {
  const schema = makeEnumSchema(CellType);

  it("accepts valid values", () => {
    expect(schema.parse("markdown")).toBe("markdown");
    expect(schema.parse("code")).toBe("code");
    expect(schema.parse("raw")).toBe("raw");
    expect(schema.parse("unknown")).toBe("unknown");
  });

  it("rejects invalid strings", () => {
    expect(() => schema.parse("invalid")).toThrow();
    expect(() => schema.parse("")).toThrow();
  });

  it("has all expected keys", () => {
    expect(Object.keys(CellType)).toEqual(["Markdown", "Code", "Raw", "Unknown"]);
  });
});

describe("OutputType", () => {
  const schema = makeEnumSchema(OutputType);

  it("accepts valid values", () => {
    expect(schema.parse("execute_result")).toBe("execute_result");
    expect(schema.parse("display_data")).toBe("display_data");
    expect(schema.parse("stream")).toBe("stream");
    expect(schema.parse("error")).toBe("error");
    expect(schema.parse("unknown")).toBe("unknown");
  });

  it("rejects invalid strings", () => {
    expect(() => schema.parse("inline")).toThrow();
  });
});

describe("RenderStrategy", () => {
  const schema = makeEnumSchema(RenderStrategy);

  it("includes all expected strategies", () => {
    expect(RenderStrategy.HtmlSandboxed).toBe("html_sandboxed");
    expect(RenderStrategy.DataFrame).toBe("data_frame");
    expect(RenderStrategy.Placeholder).toBe("placeholder");
    expect(RenderStrategy.PlainText).toBe("plain_text");
    expect(RenderStrategy.Markdown).toBe("markdown");
    expect(RenderStrategy.Code).toBe("code");
    expect(RenderStrategy.Image).toBe("image");
    expect(RenderStrategy.Svg).toBe("svg");
    expect(RenderStrategy.Latex).toBe("latex");
    expect(RenderStrategy.Stream).toBe("stream");
    expect(RenderStrategy.Error).toBe("error");
    expect(RenderStrategy.Unsupported).toBe("unsupported");
  });

  it("rejects old strategy names", () => {
    expect(() => schema.parse("html_iframe")).toThrow();
    expect(() => schema.parse("dataframe")).toThrow();
  });
});

describe("SlideLayout", () => {
  it("includes title layout", () => {
    expect(SlideLayout.Title).toBe("title");
  });

  it("includes all expected layouts", () => {
    const layouts = new Set(Object.values(SlideLayout));
    expect(layouts.has("comparison")).toBe(true);
    expect(layouts.has("appendix")).toBe(true);
  });
});

describe("SlideStatus", () => {
  const schema = makeEnumSchema(SlideStatus);

  it("accepts normal status", () => {
    expect(schema.parse("normal")).toBe("normal");
  });

  it("accepts all problem statuses", () => {
    expect(SlideStatus.TooDense).toBe("too_dense");
    expect(SlideStatus.HasUnsupportedOutput).toBe("has_unsupported_output");
    expect(SlideStatus.HasHiddenLogs).toBe("has_hidden_logs");
    expect(SlideStatus.NeedsReview).toBe("needs_review");
  });
});

describe("PresentationMode", () => {
  const schema = makeEnumSchema(PresentationMode);

  it("accepts all modes", () => {
    expect(schema.parse("default")).toBe("default");
    expect(schema.parse("executive")).toBe("executive");
    expect(schema.parse("teaching")).toBe("teaching");
    expect(schema.parse("research")).toBe("research");
  });
});

describe("ExportType", () => {
  const schema = makeEnumSchema(ExportType);

  it("accepts all types", () => {
    expect(schema.parse("html")).toBe("html");
    expect(schema.parse("html_zip")).toBe("html_zip");
    expect(schema.parse("pdf")).toBe("pdf");
    expect(schema.parse("pptx")).toBe("pptx");
    expect(schema.parse("nbxp")).toBe("nbxp");
  });
});

describe("AssetType", () => {
  it("includes derived export types", () => {
    expect(AssetType.ExportHtml).toBe("export_html");
    expect(AssetType.ExportPdf).toBe("export_pdf");
    expect(AssetType.ExportPptx).toBe("export_pptx");
    expect(AssetType.ExportNbxp).toBe("export_nbxp");
  });
});

describe("SlideBlockType", () => {
  it("includes placeholder type", () => {
    expect(SlideBlockType.Placeholder).toBe("placeholder");
    expect(SlideBlockType.Error).toBe("error");
  });
});

describe("JobStatus", () => {
  it("includes all export job statuses", () => {
    expect(JobStatus.Queued).toBe("queued");
    expect(JobStatus.Running).toBe("running");
    expect(JobStatus.Completed).toBe("completed");
    expect(JobStatus.Failed).toBe("failed");
    expect(JobStatus.Expired).toBe("expired");
  });
});

describe("AiSuggestionStatus", () => {
  it("includes failed status", () => {
    expect(AiSuggestionStatus.Failed).toBe("failed");
  });
});

describe("NotebookValidationStatus", () => {
  it("includes pending status", () => {
    expect(NotebookValidationStatus.Pending).toBe("pending");
  });
});

describe("NotebookProcessingStatus", () => {
  it("includes idle status", () => {
    expect(NotebookProcessingStatus.Idle).toBe("idle");
  });
});

describe("PresentationStatus", () => {
  const schema = z.nativeEnum(PresentationStatus);

  it("accepts all statuses", () => {
    expect(schema.parse("draft")).toBe("draft");
    expect(schema.parse("ready")).toBe("ready");
    expect(schema.parse("archived")).toBe("archived");
  });
});

describe("CellClassification", () => {
  it("includes all classification types", () => {
    expect(CellClassification.NarrativeMarkdown).toBe("narrative_markdown");
    expect(CellClassification.Noise).toBe("noise");
  });
});

describe("AiActionType", () => {
  it("includes all action types", () => {
    expect(AiActionType.GenerateTitle).toBe("generate_title");
    expect(AiActionType.ImproveTitle).toBe("improve_title");
    expect(AiActionType.SummarizeSlide).toBe("summarize_slide");
    expect(AiActionType.GenerateSpeakerNotes).toBe("generate_speaker_notes");
    expect(AiActionType.ProposeConclusion).toBe("propose_conclusion");
  });
});
