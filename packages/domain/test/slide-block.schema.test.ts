import { describe, it, expect } from "vitest";
import {
  MarkdownBlockSchema,
  CodeBlockSchema,
  OutputBlockSchema,
  ImageBlockSchema,
  SlideBlockSchema,
  TableBlockSchema,
  LatexBlockSchema,
  PlaceholderBlockSchema,
  AiSummaryBlockSchema
} from "../src/presentation-model/slide-block.schema";

const baseFields = {
  id: "00000000-0000-4000-8000-000000000060",
  slideId: "00000000-0000-4000-8000-000000000050",
  blockOrder: 0,
  visibility: {
    showCode: false,
    showOutput: true,
    showMarkdown: true,
    collapseCode: true,
    collapseLogs: true,
    renderOutputAsImage: false,
    includeInExport: true,
    visibleInEditor: true
  },
  metadata: {},
  createdAt: "2026-05-28T10:00:00.000Z",
  updatedAt: "2026-05-28T10:00:00.000Z"
};

describe("SlideBlock discriminated union", () => {
  it("parses a MarkdownBlock", () => {
    const result = MarkdownBlockSchema.parse({
      ...baseFields,
      blockType: "markdown" as const,
      content: { markdown: "# Hello" }
    });
    expect(result.blockType).toBe("markdown");
    expect(result.content.markdown).toBe("# Hello");
  });

  it("parses a CodeBlock", () => {
    const result = CodeBlockSchema.parse({
      ...baseFields,
      blockType: "code" as const,
      sourceCellId: "00000000-0000-4000-8000-000000000021",
      content: { code: 'print("x")', language: "python" }
    });
    expect(result.blockType).toBe("code");
    expect(result.content.language).toBe("python");
  });

  it("rejects CodeBlock without sourceCellId", () => {
    expect(() => CodeBlockSchema.parse({
      ...baseFields,
      blockType: "code" as const,
      content: { code: 'print("x")' }
    })).toThrow();
  });

  it("parses an OutputBlock with sourceOutputId", () => {
    const result = OutputBlockSchema.parse({
      ...baseFields,
      blockType: "output" as const,
      sourceOutputId: "00000000-0000-4000-8000-000000000030",
      content: { outputId: "out-1", mimeType: "text/plain" }
    });
    expect(result.blockType).toBe("output");
  });

  it("rejects OutputBlock without source references", () => {
    expect(() => OutputBlockSchema.parse({
      ...baseFields,
      blockType: "output" as const,
      content: { outputId: "out-1" }
    })).toThrow();
  });

  it("parses an ImageBlock with assetId", () => {
    const result = ImageBlockSchema.parse({
      ...baseFields,
      blockType: "image" as const,
      assetId: "00000000-0000-4000-8000-000000000070",
      content: { assetId: "00000000-0000-4000-8000-000000000070", alt: "chart", caption: "Revenue" }
    });
    expect(result.blockType).toBe("image");
  });

  it("rejects ImageBlock without asset reference", () => {
    expect(() => ImageBlockSchema.parse({
      ...baseFields,
      blockType: "image" as const,
      content: { alt: "chart" }
    })).toThrow();
  });

  it("parses a TableBlock", () => {
    const result = TableBlockSchema.parse({
      ...baseFields,
      blockType: "table" as const,
      assetId: "00000000-0000-4000-8000-000000000070",
      content: { columns: ["A", "B"], rowCount: 10, truncated: false }
    });
    expect(result.blockType).toBe("table");
  });

  it("parses a LatexBlock", () => {
    const result = LatexBlockSchema.parse({
      ...baseFields,
      blockType: "latex" as const,
      content: { latex: "E = mc^2", displayMode: true }
    });
    expect(result.blockType).toBe("latex");
  });

  it("parses a PlaceholderBlock", () => {
    const result = PlaceholderBlockSchema.parse({
      ...baseFields,
      blockType: "placeholder" as const,
      content: { reasonCode: "UNSUPPORTED_MIME", message: "MIME type not supported" }
    });
    expect(result.content.reasonCode).toBe("UNSUPPORTED_MIME");
  });

  it("parses an AiSummaryBlock", () => {
    const result = AiSummaryBlockSchema.parse({
      ...baseFields,
      blockType: "ai_summary" as const,
      content: { text: "Summary here" }
    });
    expect(result.blockType).toBe("ai_summary");
  });

  it("discriminated union parses correctly via blockType", () => {
    const result = SlideBlockSchema.parse({
      ...baseFields,
      blockType: "markdown" as const,
      content: { markdown: "# Slide" }
    });
    expect(result.blockType).toBe("markdown");
    // Type narrowing
    if (result.blockType === "markdown") {
      expect(result.content.markdown).toBe("# Slide");
    }
  });

  it("discriminated union rejects unknown block types", () => {
    expect(() => SlideBlockSchema.parse({
      ...baseFields,
      blockType: "unknown_type",
      content: {}
    })).toThrow();
  });
});
