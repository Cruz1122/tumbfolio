import { describe, it, expect } from "vitest";
import { PresentationDocumentSchema } from "../src/presentation-model";
import { presentationDocumentFixture } from "../src/fixtures";

describe("PresentationDocumentSchema", () => {
  it("accepts the fixture presentation document", () => {
    const result = PresentationDocumentSchema.parse(presentationDocumentFixture);
    expect(result.presentationModelVersion).toBe("1.0.0");
    expect(result.presentation.title).toBe("Analysis Report");
    expect(result.slides).toHaveLength(3);
    expect(result.blocks).toHaveLength(3);
    expect(result.theme).toBeDefined();
  });

  it("defaults presentationModelVersion when omitted", () => {
    const result = PresentationDocumentSchema.parse(presentationDocumentFixture);
    expect(result.presentationModelVersion).toBe("1.0.0");
  });

  it("rejects document with invalid presentation model version", () => {
    expect(() => PresentationDocumentSchema.parse({
      ...presentationDocumentFixture,
      presentationModelVersion: "0.5.0"
    })).toThrow();
  });

  it("accepts document without theme", () => {
    const { theme: _, ...withoutTheme } = presentationDocumentFixture;
    const result = PresentationDocumentSchema.parse({
      ...withoutTheme,
      theme: undefined
    });
    expect(result.theme).toBeUndefined();
  });

  it("accepts empty slide and block arrays", () => {
    const result = PresentationDocumentSchema.parse({
      ...presentationDocumentFixture,
      slides: [],
      blocks: [],
      assets: []
    });
    expect(result.slides).toEqual([]);
    expect(result.blocks).toEqual([]);
  });
});
